"use server";

import { createClient } from "@/lib/supabase/server";
import { MAX_DAILY_CHAT_REQUESTS } from "@/lib/constants";
import type { Profile, ChatRoom } from "@/types/database";

export async function requestChat(profileId: string) {
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

    // Get profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (profileError || !profileData) {
      return { error: "프로필을 찾을 수 없어요" };
    }

    const profile = profileData as Profile;

    // Check if profile is active
    if (!profile.is_active || new Date(profile.expires_at) < new Date()) {
      return { error: "이 프로필은 더 이상 활성화되지 않았어요" };
    }

    // Check if user is the creator
    if (profile.creator_id === user.id) {
      return { error: "본인이 만든 프로필에는 신청할 수 없어요" };
    }

    // Check if user is the matchmaker
    if (profile.matchmaker_id === user.id) {
      return { error: "주선자는 본인이 소개한 프로필에 대화를 신청할 수 없어요" };
    }

    // Check if already requested
    const { data: existingRoomData } = await supabase
      .from("chat_rooms")
      .select("id, status")
      .eq("profile_id", profileId)
      .eq("requester_id", user.id)
      .single();

    const existingRoom = existingRoomData as { id: string; status: ChatRoom["status"] } | null;

    if (existingRoom) {
      if (existingRoom.status === "pending") {
        return { error: "이미 대화를 신청한 프로필이에요. 응답을 기다려주세요." };
      }
      if (existingRoom.status === "active") {
        return { error: "이미 대화가 진행 중이에요", chatRoomId: existingRoom.id };
      }
      if (existingRoom.status === "rejected") {
        return { error: "이전에 거절당한 프로필이에요" };
      }
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("chat_rooms")
      .select("*", { count: "exact", head: true })
      .eq("requester_id", user.id)
      .gte("created_at", today.toISOString());

    if (count !== null && count >= MAX_DAILY_CHAT_REQUESTS) {
      return { error: "오늘은 더 이상 대화를 신청할 수 없어요. 내일 다시 시도해주세요!" };
    }

    // Determine target user
    // If profile has a target_id, use that. Otherwise, use creator_id
    const targetId = profile.target_id || profile.creator_id;

    // Check if blocked by either party
    const { data: blockData } = await supabase
      .from("blocks")
      .select("id")
      .or(
        `and(blocker_id.eq.${user.id},blocked_id.eq.${targetId}),and(blocker_id.eq.${targetId},blocked_id.eq.${user.id})`
      )
      .limit(1);

    if (blockData && blockData.length > 0) {
      return { error: "대화를 신청할 수 없는 사용자예요" };
    }

    // Create chat room
    const { data: chatRoomData, error: insertError } = await supabase
      .from("chat_rooms")
      .insert({
        profile_id: profileId,
        requester_id: user.id,
        target_id: targetId,
        status: "pending",
      } as never)
      .select("id")
      .single();

    if (insertError || !chatRoomData) {
      console.error("Chat room insert error:", insertError);
      return { error: "대화 신청에 실패했어요" };
    }

    const chatRoom = chatRoomData as { id: string };

    // Increment chat request count (atomic)
    await supabase.rpc("increment_chat_request_count" as never, { profile_id_param: profileId } as never);

    // Create notification for target user (non-blocking for main flow)
    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: targetId,
      type: "chat_requested",
      title: "새로운 대화 신청",
      message: `누군가가 대화를 신청했어요! 확인해보세요.`,
      link_url: `/chat?pending=${chatRoom.id}`,
    } as never);
    if (notifError) console.error("Notification insert error:", notifError);

    return {
      success: true,
      chatRoomId: chatRoom.id,
    };
  } catch (error) {
    console.error("Request chat error:", error);
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}
