"use server";

import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { serverProfileDataSchema, MAX_PHOTOS } from "@/lib/validations/profile";
import { processAndUploadProfileImages } from "@/lib/image-processing";
import type { InsertTables, Invitation } from "@/types/database";

export async function submitInviteProfile(
  inviteCode: string,
  formData: FormData
) {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "로그인이 필요해요" };
    }

    // Validate invitation
    const { data: invitationData, error: inviteError } = await supabase
      .from("invitations")
      .select("*")
      .eq("invite_code", inviteCode)
      .single();

    if (inviteError || !invitationData) {
      return { error: "유효하지 않은 초대 링크예요" };
    }

    const invitation = invitationData as Invitation;

    if (invitation.status !== "pending") {
      return { error: "이미 프로필이 작성된 초대예요" };
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return { error: "만료된 초대 링크예요" };
    }

    // Prevent matchmaker from filling own invite
    if (invitation.matchmaker_id === user.id) {
      return { error: "본인이 만든 초대에는 프로필을 작성할 수 없어요" };
    }

    // Extract photos from FormData
    const photoCount = parseInt(formData.get("photoCount") as string) || 0;
    if (photoCount < 1 || photoCount > MAX_PHOTOS) {
      return { error: `사진을 1~${MAX_PHOTOS}장 업로드해주세요` };
    }

    const photos: { file: File; blurEnabled: boolean }[] = [];
    for (let i = 0; i < photoCount; i++) {
      const file = formData.get(`photo_${i}`);
      if (!file || !(file instanceof File)) {
        return { error: "사진 파일을 확인해주세요" };
      }
      if (file.size > 10 * 1024 * 1024) {
        return { error: "10MB 이하의 사진만 업로드 가능해요" };
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        return { error: "JPG, PNG, WebP 형식만 가능해요" };
      }
      photos.push({
        file,
        blurEnabled: formData.get(`blur_${i}`) === "true",
      });
    }

    // Validate other fields
    const rawData = JSON.parse(formData.get("data") as string);
    const validationResult = serverProfileDataSchema.safeParse(rawData);
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message };
    }

    const validData = validationResult.data;

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
      return { error: "프로필 생성에 실패했어요. 다시 시도해주세요." };
    }

    // Process and upload images (다중 사진)
    const { photos: processedPhotos, photoUrl, originalPhotoUrl } = await processAndUploadProfileImages(
      supabase,
      photos,
      user.id,
      shortId
    );

    // Create profile (초대: is_active = false, 주선자 공유 후 활성화)
    const profileData: InsertTables<"profiles"> = {
      short_id: shortId,
      creator_id: user.id,
      matchmaker_id: invitation.matchmaker_id,
      invitation_id: invitation.id,
      photo_url: photoUrl,
      original_photo_url: originalPhotoUrl,
      photos: processedPhotos,
      age: validData.age,
      gender: validData.gender,
      occupation_category: validData.occupationCategory,
      bio: validData.bio,
      interest_tags: validData.interestTags,
      mbti: validData.mbti || null,
      music_genre: validData.musicGenre || null,
      instagram_id: validData.instagramId || null,
      kakao_open_chat_id: null,
      // 비활성 상태 — 주선자 공유 시 활성화
      is_active: false,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 임시 (공유 시 재설정)
    };

    const { data: profile, error: insertError } = await supabase
      .from("profiles")
      .insert(profileData as never)
      .select("id, short_id")
      .single();

    if (insertError || !profile) {
      console.error("Profile insert error:", insertError);
      return { error: "프로필 생성에 실패했어요" };
    }

    const result = profile as { id: string; short_id: string };

    // Update invitation
    const { error: updateError } = await supabase
      .from("invitations")
      .update({
        status: "completed",
        target_id: user.id,
        profile_id: result.id,
      } as never)
      .eq("id", invitation.id);

    if (updateError) {
      console.error("Invitation update error:", updateError);
    }

    // Notify matchmaker
    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: invitation.matchmaker_id,
      type: "profile_completed",
      title: "프로필 작성 완료",
      message: "초대한 친구가 프로필을 작성했어요! 확인하고 공유해보세요.",
      link_url: "/dashboard",
    } as never);
    if (notifError) console.error("Notification insert error:", notifError);

    return {
      success: true,
      profileId: result.id,
      shortId: result.short_id,
    };
  } catch (error) {
    console.error("Submit invite profile error:", error);
    if (error instanceof Error && error.message.includes("사진")) {
      return { error: error.message };
    }
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}
