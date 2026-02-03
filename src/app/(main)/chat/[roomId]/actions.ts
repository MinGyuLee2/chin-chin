"use server";

import { createClient } from "@/lib/supabase/server";
import { CHAT_ROOM_EXPIRY_HOURS } from "@/lib/constants";
import { filterContactInfo } from "@/lib/utils";
import type { ChatRoom, Profile } from "@/types/database";

export async function acceptChatRequest(roomId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: "로그인이 필요해요" };

    // Fetch room and verify
    const { data: roomData } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (!roomData) return { error: "채팅방을 찾을 수 없어요" };
    const room = roomData as ChatRoom;

    if (room.target_id !== user.id) return { error: "권한이 없어요" };
    if (room.status !== "pending") return { error: "이미 처리된 요청이에요" };

    // Accept: set active + expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CHAT_ROOM_EXPIRY_HOURS);

    const { error: updateError } = await supabase
      .from("chat_rooms")
      .update({
        status: "active",
        expires_at: expiresAt.toISOString(),
      } as never)
      .eq("id", roomId)
      .eq("status", "pending"); // Conditional update to prevent race condition

    if (updateError) return { error: "수락에 실패했어요" };

    // Notify requester
    await supabase.from("notifications").insert({
      user_id: room.requester_id,
      type: "chat_accepted",
      title: "대화가 시작되었어요!",
      message: "상대방이 대화 신청을 수락했어요. 지금 바로 대화해보세요!",
      link_url: `/chat/${roomId}`,
    } as never);

    return { success: true };
  } catch (error) {
    console.error("Accept chat request error:", error);
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}

export async function rejectChatRequest(roomId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: "로그인이 필요해요" };

    const { data: roomData } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (!roomData) return { error: "채팅방을 찾을 수 없어요" };
    const room = roomData as ChatRoom;

    if (room.target_id !== user.id) return { error: "권한이 없어요" };
    if (room.status !== "pending") return { error: "이미 처리된 요청이에요" };

    const { error: updateError } = await supabase
      .from("chat_rooms")
      .update({ status: "rejected" } as never)
      .eq("id", roomId)
      .eq("status", "pending");

    if (updateError) return { error: "거절에 실패했어요" };

    // Notify requester
    await supabase.from("notifications").insert({
      user_id: room.requester_id,
      type: "chat_rejected",
      title: "대화 신청 결과",
      message: "아쉽지만 상대방이 정중히 거절했어요.",
      link_url: `/chat`,
    } as never);

    return { success: true };
  } catch (error) {
    console.error("Reject chat request error:", error);
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}

export async function sendMessage(roomId: string, content: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: "로그인이 필요해요" };

    // Validate content
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > 500) {
      return { error: "메시지는 1~500자 사이로 입력해주세요" };
    }

    // Fetch room
    const { data: roomData } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (!roomData) return { error: "채팅방을 찾을 수 없어요" };
    const room = roomData as ChatRoom;

    // Verify participant
    if (room.requester_id !== user.id && room.target_id !== user.id) {
      return { error: "권한이 없어요" };
    }

    // Check status
    if (room.status !== "active") {
      return { error: "대화가 종료된 채팅방이에요" };
    }

    // Check expiry server-side
    if (room.expires_at && new Date(room.expires_at) < new Date()) {
      await supabase
        .from("chat_rooms")
        .update({ status: "expired" } as never)
        .eq("id", roomId);
      return { error: "대화가 만료되었어요" };
    }

    // Filter contact info
    const { filtered, hasContact } = filterContactInfo(trimmed);

    // Insert message
    const { data: messageData, error: insertError } = await supabase
      .from("messages")
      .insert({
        room_id: roomId,
        sender_id: user.id,
        content: filtered,
      } as never)
      .select()
      .single();

    if (insertError || !messageData) {
      console.error("Message insert error:", insertError);
      return { error: "메시지 전송에 실패했어요" };
    }

    // Update last_message_at
    await supabase
      .from("chat_rooms")
      .update({ last_message_at: new Date().toISOString() } as never)
      .eq("id", roomId);

    return { success: true, contactFiltered: hasContact, message: messageData };
  } catch (error) {
    console.error("Send message error:", error);
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}

export async function markMessagesAsRead(roomId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: "로그인이 필요해요" };

    await supabase
      .from("messages")
      .update({ is_read: true } as never)
      .eq("room_id", roomId)
      .neq("sender_id", user.id)
      .eq("is_read", false);

    return { success: true };
  } catch (error) {
    console.error("Mark messages as read error:", error);
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}

export async function requestProfileReveal(roomId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: "로그인이 필요해요" };

    const { data: roomData } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (!roomData) return { error: "채팅방을 찾을 수 없어요" };
    const room = roomData as ChatRoom;

    if (room.requester_id !== user.id && room.target_id !== user.id) {
      return { error: "권한이 없어요" };
    }
    if (room.status !== "active") {
      return { error: "활성 상태의 채팅방에서만 요청할 수 있어요" };
    }
    if (room.profile_revealed) {
      return { error: "이미 프로필이 공개되었어요" };
    }
    if (room.reveal_requested_by) {
      return { error: "이미 공개 요청이 진행 중이에요" };
    }

    const { error: updateError } = await supabase
      .from("chat_rooms")
      .update({ reveal_requested_by: user.id } as never)
      .eq("id", roomId);

    if (updateError) return { error: "공개 요청에 실패했어요" };

    // Notify the other user
    const otherUserId =
      room.requester_id === user.id ? room.target_id : room.requester_id;

    await supabase.from("notifications").insert({
      user_id: otherUserId,
      type: "reveal_requested",
      title: "프로필 공개 요청",
      message: "상대방이 프로필 공개를 요청했어요!",
      link_url: `/chat/${roomId}`,
    } as never);

    return { success: true };
  } catch (error) {
    console.error("Request profile reveal error:", error);
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}

export async function acceptProfileReveal(roomId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: "로그인이 필요해요" };

    const { data: roomData } = await supabase
      .from("chat_rooms")
      .select("*, profile:profiles(*)")
      .eq("id", roomId)
      .single();

    if (!roomData) return { error: "채팅방을 찾을 수 없어요" };
    const room = roomData as ChatRoom & { profile: Profile };

    if (room.requester_id !== user.id && room.target_id !== user.id) {
      return { error: "권한이 없어요" };
    }
    if (!room.reveal_requested_by) {
      return { error: "공개 요청이 없어요" };
    }
    if (room.reveal_requested_by === user.id) {
      return { error: "본인의 요청은 수락할 수 없어요" };
    }

    const { error: updateError } = await supabase
      .from("chat_rooms")
      .update({
        profile_revealed: true,
        profile_revealed_at: new Date().toISOString(),
        status: "completed",
        reveal_requested_by: null,
      } as never)
      .eq("id", roomId);

    if (updateError) return { error: "프로필 공개에 실패했어요" };

    // Notify both users
    const otherUserId =
      room.requester_id === user.id ? room.target_id : room.requester_id;

    await supabase.from("notifications").insert([
      {
        user_id: user.id,
        type: "reveal_accepted",
        title: "프로필이 공개되었어요!",
        message: "상대방의 프로필을 확인해보세요.",
        link_url: `/chat/${roomId}`,
      },
      {
        user_id: otherUserId,
        type: "reveal_accepted",
        title: "프로필이 공개되었어요!",
        message: "상대방의 프로필을 확인해보세요.",
        link_url: `/chat/${roomId}`,
      },
    ] as never);

    return {
      success: true,
      profile: {
        originalPhotoUrl: room.profile.original_photo_url,
        instagramId: room.profile.instagram_id,
        kakaoOpenChatId: room.profile.kakao_open_chat_id,
        name: room.profile.name,
      },
    };
  } catch (error) {
    console.error("Accept profile reveal error:", error);
    return { error: "알 수 없는 오류가 발생했어요" };
  }
}
