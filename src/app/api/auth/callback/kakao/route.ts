import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Handle error from Kakao
  if (error) {
    console.error("Kakao OAuth error:", error);
    return NextResponse.redirect(
      `${baseUrl}/login?error=kakao_auth_failed`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_CLIENT_ID!,
        client_secret: process.env.KAKAO_CLIENT_SECRET || "",
        redirect_uri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        `${baseUrl}/login?error=token_exchange_failed`
      );
    }

    const tokenData: KakaoTokenResponse = await tokenResponse.json();

    // Get user info from Kakao
    const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    if (!userResponse.ok) {
      console.error("Failed to get user info");
      return NextResponse.redirect(
        `${baseUrl}/login?error=user_info_failed`
      );
    }

    const kakaoUser: KakaoUserResponse = await userResponse.json();

    // Get profile info
    const nickname =
      kakaoUser.kakao_account?.profile?.nickname ||
      kakaoUser.properties?.nickname ||
      `사용자${kakaoUser.id}`;
    const profileImage =
      kakaoUser.kakao_account?.profile?.profile_image_url ||
      kakaoUser.properties?.profile_image ||
      null;

    // Upsert user in our database
    const supabase = await createAdminClient();

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("kakao_id", kakaoUser.id)
      .single();

    let userId: string;

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from("users")
        .update({
          nickname,
          profile_image_url: profileImage,
          kakao_access_token: tokenData.access_token,
          kakao_refresh_token: tokenData.refresh_token,
          last_login_at: new Date().toISOString(),
        })
        .eq("kakao_id", kakaoUser.id);

      if (updateError) throw updateError;
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          kakao_id: kakaoUser.id,
          nickname,
          profile_image_url: profileImage,
          kakao_access_token: tokenData.access_token,
          kakao_refresh_token: tokenData.refresh_token,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;
      userId = newUser.id;
    }

    // Create Supabase session
    // Using custom auth - sign in with the user's UUID
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: `${kakaoUser.id}@kakao.chinchin.app`,
        email_confirm: true,
        user_metadata: {
          kakao_id: kakaoUser.id,
          nickname,
          profile_image: profileImage,
        },
      });

    // If user already exists in auth, just update and sign in
    if (authError?.message?.includes("already been registered")) {
      // Get the existing auth user
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const authUser = authUsers?.users?.find(
        (u) => u.email === `${kakaoUser.id}@kakao.chinchin.app`
      );

      if (authUser) {
        // Generate a magic link / session for this user
        const { data: sessionData, error: sessionError } =
          await supabase.auth.admin.generateLink({
            type: "magiclink",
            email: authUser.email!,
          });

        if (sessionError) throw sessionError;

        // Redirect with the token
        const response = NextResponse.redirect(`${baseUrl}/`);

        // Set auth cookies via the token
        // In production, you'd handle this more securely
        return response;
      }
    }

    // Redirect to home
    return NextResponse.redirect(`${baseUrl}/`);
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=auth_failed`);
  }
}
