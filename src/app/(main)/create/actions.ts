"use server";

import { nanoid } from "nanoid";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileFormData } from "@/lib/validations/profile";
import { PROFILE_EXPIRY_HOURS } from "@/lib/constants";
import type { InsertTables } from "@/types/database";

export async function createProfile(data: ProfileFormData) {
  try {
    const supabase = await createClient();

    // Get current user
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

    if (count && count >= 10) {
      return { error: "오늘은 더 이상 링크를 만들 수 없어요. 내일 다시 시도해주세요!" };
    }

    // Generate short ID
    let shortId = nanoid(8);
    let attempts = 0;

    // Ensure uniqueness
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

    // Upload images
    const photoBuffer = await validData.photo.arrayBuffer();
    const photoExtension = validData.photo.type.split("/")[1];
    const photoPath = `${user.id}/${shortId}/original.${photoExtension}`;
    const blurredPath = `${user.id}/${shortId}/blurred.jpeg`;

    // Upload original photo
    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(photoPath, photoBuffer, {
        contentType: validData.photo.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { error: "사진 업로드에 실패했어요" };
    }

    // Generate blurred version using Sharp
    const blurredBuffer = await sharp(Buffer.from(photoBuffer))
      .resize(400)
      .blur(30)
      .jpeg({ quality: 60 })
      .toBuffer();

    await supabase.storage
      .from("profiles")
      .upload(blurredPath, blurredBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    // Get public URLs
    const { data: originalUrl } = supabase.storage
      .from("profiles")
      .getPublicUrl(photoPath);

    const { data: blurredUrl } = supabase.storage
      .from("profiles")
      .getPublicUrl(blurredPath);

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + PROFILE_EXPIRY_HOURS);

    // Create profile
    const profileData: InsertTables<"profiles"> = {
      short_id: shortId,
      creator_id: user.id,
      photo_url: blurredUrl.publicUrl,
      original_photo_url: originalUrl.publicUrl,
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
    console.error("Create profile error:", error);
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}
