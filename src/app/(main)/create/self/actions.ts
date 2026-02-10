"use server";

import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileFormData } from "@/lib/validations/profile";
import { PROFILE_EXPIRY_HOURS, MAX_DAILY_PROFILE_CREATIONS } from "@/lib/constants";
import { processAndUploadProfileImage } from "@/lib/image-processing";
import type { InsertTables } from "@/types/database";

export async function createSelfProfile(data: ProfileFormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "로그인이 필요해요" };
    }

    // Validate input
    const validationResult = profileSchema.safeParse(data);
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message };
    }

    const validData = validationResult.data;

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", user.id)
      .gte("created_at", today.toISOString());

    if (count !== null && count >= MAX_DAILY_PROFILE_CREATIONS) {
      return { error: "오늘은 더 이상 프로필을 만들 수 없어요. 내일 다시 시도해주세요!" };
    }

    // Generate short ID
    let shortId = nanoid(8);
    let attempts = 0;

    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("short_id", shortId)
        .single();

      if (!existing) break;
      shortId = nanoid(8);
      attempts++;
    }

    if (attempts >= 5) {
      return { error: "링크 생성에 실패했어요. 다시 시도해주세요." };
    }

    // Process and upload image
    const { photoUrl, originalPhotoUrl } = await processAndUploadProfileImage(
      supabase,
      validData.photo,
      user.id,
      shortId
    );

    // Calculate expiry time (즉시 활성화)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + PROFILE_EXPIRY_HOURS);

    // Create profile (셀프: matchmaker_id = null)
    const profileData: InsertTables<"profiles"> = {
      short_id: shortId,
      creator_id: user.id,
      matchmaker_id: null,
      invitation_id: null,
      photo_url: photoUrl,
      original_photo_url: originalPhotoUrl,
      age: validData.age,
      gender: validData.gender,
      occupation_category: validData.occupationCategory,
      bio: validData.bio,
      interest_tags: validData.interestTags,
      mbti: validData.mbti || null,
      music_genre: validData.musicGenre || null,
      instagram_id: validData.instagramId || null,
      kakao_open_chat_id: null,
      expires_at: expiresAt.toISOString(),
      is_active: true,
    };

    const { data: profile, error: insertError } = await supabase
      .from("profiles")
      .insert(profileData as never)
      .select("id, short_id")
      .single();

    if (insertError || !profile) {
      console.error("Insert error:", insertError);
      return { error: "프로필 생성에 실패했어요" };
    }

    const result = profile as { id: string; short_id: string };
    return {
      success: true,
      profileId: result.id,
      shortId: result.short_id,
    };
  } catch (error) {
    console.error("Create self profile error:", error);
    if (error instanceof Error && error.message.includes("사진")) {
      return { error: error.message };
    }
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}
