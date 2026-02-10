"use server";

import { createClient } from "@/lib/supabase/server";
import { PROFILE_EXPIRY_HOURS } from "@/lib/constants";

export async function activateAndShare(invitationId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: "로그인이 필요해요" };

    // Verify matchmaker ownership
    const { data: invitationData } = await supabase
      .from("invitations")
      .select("id, matchmaker_id, profile_id, target_id, status")
      .eq("id", invitationId)
      .single();

    if (!invitationData) return { error: "초대를 찾을 수 없어요" };

    const invitation = invitationData as {
      id: string;
      matchmaker_id: string;
      profile_id: string | null;
      target_id: string | null;
      status: string;
    };

    if (invitation.matchmaker_id !== user.id) return { error: "권한이 없어요" };
    if (invitation.status !== "completed") return { error: "아직 프로필이 작성되지 않았어요" };
    if (!invitation.profile_id) return { error: "프로필을 찾을 수 없어요" };

    // Activate profile (24h timer starts now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + PROFILE_EXPIRY_HOURS);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        is_active: true,
        expires_at: expiresAt.toISOString(),
      } as never)
      .eq("id", invitation.profile_id);

    if (profileError) return { error: "프로필 활성화에 실패했어요" };

    // Update invitation status
    await supabase
      .from("invitations")
      .update({ status: "shared" } as never)
      .eq("id", invitationId);

    // Notify target
    if (invitation.target_id) {
      await supabase.from("notifications").insert({
        user_id: invitation.target_id,
        type: "profile_shared",
        title: "프로필이 공유되었어요!",
        message: "프로필이 공유되었어요! 매칭이 시작되었습니다.",
        link_url: "/dashboard",
      } as never);
    }

    // Get profile short_id for sharing
    const { data: profileData } = await supabase
      .from("profiles")
      .select("short_id")
      .eq("id", invitation.profile_id)
      .single();

    return {
      success: true,
      shortId: (profileData as { short_id: string } | null)?.short_id,
    };
  } catch (error) {
    console.error("Activate and share error:", error);
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}

export async function deleteInvitation(invitationId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: "로그인이 필요해요" };

    const { data: invitationData } = await supabase
      .from("invitations")
      .select("id, matchmaker_id, profile_id")
      .eq("id", invitationId)
      .single();

    if (!invitationData) return { error: "초대를 찾을 수 없어요" };

    const invitation = invitationData as { id: string; matchmaker_id: string; profile_id: string | null };

    if (invitation.matchmaker_id !== user.id) return { error: "권한이 없어요" };

    // Delete associated profile if exists
    if (invitation.profile_id) {
      await supabase.from("profiles").delete().eq("id", invitation.profile_id);
    }

    // Delete invitation
    const { error: deleteError } = await supabase
      .from("invitations")
      .delete()
      .eq("id", invitationId);

    if (deleteError) return { error: "삭제에 실패했어요" };

    return { success: true };
  } catch (error) {
    console.error("Delete invitation error:", error);
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}

export async function deleteProfile(profileId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: "로그인이 필요해요" };

    // Verify ownership
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, creator_id")
      .eq("id", profileId)
      .single();

    if (!profile || (profile as { creator_id: string }).creator_id !== user.id) {
      return { error: "권한이 없어요" };
    }

    const { error: deleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", profileId);

    if (deleteError) return { error: "삭제에 실패했어요" };

    return { success: true };
  } catch (error) {
    console.error("Delete profile error:", error);
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}

export async function getBlockedUsers() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: "로그인이 필요해요", blocks: [] };

    const { data, error } = await supabase
      .from("blocks")
      .select("*, blocked:users!blocks_blocked_id_fkey(id, nickname, profile_image_url)")
      .eq("blocker_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get blocked users error:", error);
      return { error: "차단 목록을 불러올 수 없어요", blocks: [] };
    }

    return { blocks: data || [] };
  } catch (error) {
    console.error("Get blocked users error:", error);
    return { error: "알 수 없는 오류가 발생했어요", blocks: [] };
  }
}

export async function unblockUser(blockId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: "로그인이 필요해요" };

    const { error: deleteError } = await supabase
      .from("blocks")
      .delete()
      .eq("id", blockId)
      .eq("blocker_id", user.id);

    if (deleteError) return { error: "차단 해제에 실패했어요" };

    return { success: true };
  } catch (error) {
    console.error("Unblock user error:", error);
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}
