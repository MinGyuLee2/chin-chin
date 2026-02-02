"use server";

import { createClient } from "@/lib/supabase/server";
import { MAX_DAILY_CHAT_REQUESTS } from "@/lib/constants";

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
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      return { error: "프로필을 찾을 수 없어요" };
    }

    // Check if profile is active
    if (!profile.is_active || new Date(profile.expires_at) < new Date()) {
      return { error: "이 프로필은 더 이상 활성화되지 않았어요" };
    }

    // Check if user is the creator
    if (profile.creator_id === user.id) {
      return { error: "본인이 만든 프로필에는 신청할 수 없어요" };
    }

    // Check if already requested
    const { data: existingRoom } = await supabase
      .from("chat_rooms")
      .select("id, status")
      .eq("profile_id", profileId)
      .eq("requester_id", user.id)
      .single();

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

    if (count && count >= MAX_DAILY_CHAT_REQUESTS) {
      return { error: "오늘은 더 이상 대화를 신청할 수 없어요. 내일 다시 시도해주세요!" };
    }

    // Determine target user
    // If profile has a target_id, use that. Otherwise, use creator_id
    const targetId = profile.target_id || profile.creator_id;

    // Create chat room
    const { data: chatRoom, error: insertError } = await supabase
      .from("chat_rooms")
      .insert({
        profile_id: profileId,
        requester_id: user.id,
        target_id: targetId,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Chat room insert error:", insertError);
      return { error: "대화 신청에 실패했어요" };
    }

    // Increment chat request count
    await supabase.rpc("increment_chat_request_count", {
      profile_uuid: profileId,
    });

    // Create notification for target user
    await supabase.from("notifications").insert({
      user_id: targetId,
      type: "chat_requested",
      title: "새로운 대화 신청",
      message: `누군가가 대화를 신청했어요! 확인해보세요.`,
      link_url: `/chat?pending=${chatRoom.id}`,
    });

    // TODO: Send Kakao notification

    return {
      success: true,
      chatRoomId: chatRoom.id,
    };
  } catch (error) {
    console.error("Request chat error:", error);
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}
