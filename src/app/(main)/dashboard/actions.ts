"use server";

import { createClient } from "@/lib/supabase/server";

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
