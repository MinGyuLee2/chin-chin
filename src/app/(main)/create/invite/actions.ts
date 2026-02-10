"use server";

import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { INVITATION_EXPIRY_DAYS, MAX_DAILY_INVITATIONS } from "@/lib/constants";

export async function createInvitation(message?: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "로그인이 필요해요" };
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("invitations")
      .select("*", { count: "exact", head: true })
      .eq("matchmaker_id", user.id)
      .gte("created_at", today.toISOString());

    if (count !== null && count >= MAX_DAILY_INVITATIONS) {
      return { error: "오늘은 더 이상 초대를 보낼 수 없어요. 내일 다시 시도해주세요!" };
    }

    // Generate invite code with collision check
    let inviteCode = nanoid(8);
    let attempts = 0;

    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("invitations")
        .select("id")
        .eq("invite_code", inviteCode)
        .single();

      if (!existing) break;
      inviteCode = nanoid(8);
      attempts++;
    }

    if (attempts >= 5) {
      return { error: "초대 링크 생성에 실패했어요. 다시 시도해주세요." };
    }

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    // Create invitation
    const { data: invitation, error: insertError } = await supabase
      .from("invitations")
      .insert({
        invite_code: inviteCode,
        matchmaker_id: user.id,
        status: "pending",
        matchmaker_message: message || null,
        expires_at: expiresAt.toISOString(),
      } as never)
      .select("id, invite_code")
      .single();

    if (insertError || !invitation) {
      console.error("Invitation insert error:", insertError);
      return { error: "초대 생성에 실패했어요" };
    }

    const result = invitation as { id: string; invite_code: string };
    return {
      success: true,
      invitationId: result.id,
      inviteCode: result.invite_code,
    };
  } catch (error) {
    console.error("Create invitation error:", error);
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}
