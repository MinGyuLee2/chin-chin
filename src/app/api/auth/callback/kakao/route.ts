import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/types/database";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

// Admin client with empty setAll causes Supabase SSR to infer mutation types as `never`.
// `as never` is required for admin client operations only — regular clients are typed correctly.

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
}

interface KakaoUserResponse {
  id: number;
  connected_at: string;
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account?: {
    profile_nickname_needs_agreement?: boolean;
    profile_image_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
      is_default_image?: boolean;
    };
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error) {
    console.error("[kakao-callback] OAuth error:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=kakao_auth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
  }

  // CSRF 보호: state 파라미터 검증
  const storedState = request.cookies.get("kakao_oauth_state")?.value;
  if (!state || !storedState || state !== storedState) {
    console.error("[kakao-callback] State mismatch — possible CSRF attack");
    return NextResponse.redirect(`${baseUrl}/login?error=invalid_state`);
  }

  // Collect cookies to set on the final response
  const pendingCookies: CookieToSet[] = [];

  try {
    // 1. Exchange code for Kakao tokens
    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_CLIENT_ID!,
        client_secret: process.env.KAKAO_CLIENT_SECRET!,
        redirect_uri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("[kakao-callback] Token exchange failed:", errorData);
      return NextResponse.redirect(
        `${baseUrl}/login?error=token_exchange_failed`
      );
    }

    const tokenData: KakaoTokenResponse = await tokenResponse.json();

    // 2. Get user info from Kakao
    const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    if (!userResponse.ok) {
      console.error("[kakao-callback] Failed to get user info");
      return NextResponse.redirect(
        `${baseUrl}/login?error=user_info_failed`
      );
    }

    const kakaoUser: KakaoUserResponse = await userResponse.json();

    const nickname =
      kakaoUser.kakao_account?.profile?.nickname ||
      kakaoUser.properties?.nickname ||
      `사용자${kakaoUser.id}`;
    const profileImage =
      kakaoUser.kakao_account?.profile?.profile_image_url ||
      kakaoUser.properties?.profile_image ||
      null;

    const email = `${kakaoUser.id}@kakao.chinchin.app`;

    // Admin client for user management (service role key)
    const adminSupabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Admin client doesn't need to set response cookies
          },
        },
      }
    );

    // Regular client for session management (collects cookies)
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: CookieToSet[]) {
            pendingCookies.push(...cookiesToSet);
          },
        },
      }
    );

    // 3. Create auth user if not exists
    const { data: createData, error: createError } =
      await adminSupabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          kakao_id: kakaoUser.id,
          nickname,
          profile_image: profileImage,
        },
      });

    const isNewUser = !!createData?.user;
    if (!isNewUser && !createError?.message?.includes("already been registered")) {
      throw createError || new Error("Failed to create auth user");
    }

    // 4. Generate magic link (also resolves user ID for existing users)
    const { data: linkData, error: linkError } =
      await adminSupabase.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError || !linkData) {
      console.error("[kakao-callback] generateLink error:", linkError);
      throw linkError || new Error("Failed to generate magic link");
    }

    // Use createUser's ID for new users, generateLink's user.id for existing
    const authUserId = createData?.user?.id ?? linkData.user.id;

    // Update metadata for existing users
    if (!isNewUser) {
      await adminSupabase.auth.admin.updateUserById(authUserId, {
        user_metadata: {
          kakao_id: kakaoUser.id,
          nickname,
          profile_image: profileImage,
        },
      });
    }

    // 5. Verify OTP to establish session
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    });

    if (verifyError) {
      console.error("[kakao-callback] verifyOtp error:", verifyError);
      throw verifyError;
    }

    // 6. Upsert user in our users table (using auth user ID as users.id)
    const { data: existingUser } = await adminSupabase
      .from("users")
      .select("id")
      .eq("kakao_id", kakaoUser.id)
      .single();

    if (existingUser) {
      // Fix ID mismatch: users.id must equal Supabase auth user ID
      const needsIdFix = (existingUser as { id: string }).id !== authUserId;
      if (needsIdFix) {
        // Delete old record and re-insert with correct ID
        await adminSupabase
          .from("users")
          .delete()
          .eq("kakao_id", kakaoUser.id);
        await adminSupabase.from("users").insert({
          id: authUserId,
          kakao_id: kakaoUser.id,
          nickname,
          profile_image_url: profileImage,
          kakao_access_token: tokenData.access_token,
          kakao_refresh_token: tokenData.refresh_token,
        } as never);
      } else {
        await adminSupabase
          .from("users")
          .update({
            nickname,
            profile_image_url: profileImage,
            kakao_access_token: tokenData.access_token,
            kakao_refresh_token: tokenData.refresh_token,
            last_login_at: new Date().toISOString(),
          } as never)
          .eq("kakao_id", kakaoUser.id);
      }
    } else {
      await adminSupabase.from("users").insert({
        id: authUserId,
        kakao_id: kakaoUser.id,
        nickname,
        profile_image_url: profileImage,
        kakao_access_token: tokenData.access_token,
        kakao_refresh_token: tokenData.refresh_token,
      } as never);
    }

    // 7. Build redirect response AFTER all async work is done, then set cookies
    const response = NextResponse.redirect(`${baseUrl}/`);
    for (const cookie of pendingCookies) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }
    // state 쿠키 삭제
    response.cookies.set("kakao_oauth_state", "", { maxAge: 0, path: "/" });

    return response;
  } catch (err) {
    console.error("[kakao-callback] Error:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=auth_failed`);
  }
}
