"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { useToast } from "@/components/ui/toaster";
import { ChatHeader } from "@/components/chat/chat-header";
import { AdminChatHeader } from "@/components/chat/admin-chat-header";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatExpiredOverlay } from "@/components/chat/chat-expired-overlay";
import { ProfileRevealBanner } from "@/components/chat/profile-reveal-banner";
import { ProfileRevealedView } from "@/components/chat/profile-revealed-view";
import { createClient } from "@/lib/supabase/client";
import { isAdminChat } from "@/lib/admin-chat";
import {
  sendMessage,
  markMessagesAsRead,
  requestProfileReveal,
  acceptProfileReveal,
} from "./actions";
import type { ChatRoom, Profile } from "@/types/database";

interface Props {
  params: Promise<{ roomId: string }>;
}

type RoomWithProfile = ChatRoom & { profile: Profile | null };

export default function ChatRoomPage({ params }: Props) {
  const { roomId } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [room, setRoom] = useState<RoomWithProfile | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const supabaseRef = useRef(createClient());
  const markReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch room data
  useEffect(() => {
    if (!user) return;

    async function fetchRoom() {
      const { data, error } = await supabaseRef.current
        .from("chat_rooms")
        .select("*, profile:profiles(*)")
        .eq("id", roomId)
        .single();

      if (error || !data) {
        console.error("Fetch room error:", error);
        router.push("/chat");
        return;
      }

      const roomData = data as RoomWithProfile;

      // Verify participant
      if (
        roomData.requester_id !== user!.id &&
        roomData.target_id !== user!.id
      ) {
        router.push("/chat");
        return;
      }

      setRoom(roomData);
      setIsLoadingRoom(false);
    }

    fetchRoom();
  }, [user, roomId, router]);

  // Subscribe to room changes (status, reveal)
  useEffect(() => {
    if (!user) return;
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`room_status:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setRoom((prev) => {
            if (!prev) return prev;
            return { ...prev, ...(payload.new as ChatRoom) };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, roomId]);

  // Realtime messages
  const { messages, isLoading: messagesLoading, hasMore, loadMore, addMessage } =
    useRealtimeMessages(roomId);

  // Mark messages as read (debounced)
  useEffect(() => {
    if (!user || !room || messages.length === 0) return;

    const hasUnread = messages.some(
      (m) => m.sender_id !== user.id && !m.is_read
    );
    if (!hasUnread) return;

    if (markReadTimeoutRef.current) {
      clearTimeout(markReadTimeoutRef.current);
    }

    markReadTimeoutRef.current = setTimeout(() => {
      markMessagesAsRead(roomId);
    }, 500);

    return () => {
      if (markReadTimeoutRef.current) {
        clearTimeout(markReadTimeoutRef.current);
      }
    };
  }, [messages, user, room, roomId]);

  const handleSend = useCallback(
    async (content: string) => {
      const result = await sendMessage(roomId, content);
      if (result.error) {
        toast({
          title: "전송 실패",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      // Optimistic: immediately add sent message to local state
      const msg = (result as { message?: unknown }).message;
      if (msg) {
        addMessage(msg as import("@/types/database").Message);
      }
      if ((result as { contactFiltered?: boolean }).contactFiltered) {
        toast({
          title: "연락처 정보 필터링",
          description: "연락처 정보가 포함되어 자동으로 필터링되었어요",
        });
      }
    },
    [roomId, toast, addMessage]
  );

  const handleRequestReveal = useCallback(async () => {
    const result = await requestProfileReveal(roomId);
    if (result.error) {
      toast({
        title: "오류",
        description: result.error,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "공개 요청 완료",
      description: "상대방의 응답을 기다려주세요",
      variant: "success",
    });
  }, [roomId, toast]);

  const handleAcceptReveal = useCallback(async () => {
    const result = await acceptProfileReveal(roomId);
    if (result.error) {
      toast({
        title: "오류",
        description: result.error,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "프로필이 공개되었어요!",
      description: "서로의 프로필을 확인해보세요",
      variant: "success",
    });
  }, [roomId, toast]);

  const handleExpire = useCallback(() => {
    setRoom((prev) => {
      if (!prev) return prev;
      return { ...prev, status: "expired" };
    });
  }, []);

  // Loading states
  if (authLoading || isLoadingRoom || !room || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent" />
      </div>
    );
  }

  const isAdmin = isAdminChat(room);
  const isActive = room.status === "active";
  const isCompleted = room.status === "completed";
  const isExpired = room.status === "expired";
  const showInput = isActive;
  const showExpiredOverlay = !isAdmin && (isExpired || isCompleted);

  return (
    <div className="flex h-screen flex-col bg-white">
      {isAdmin ? (
        <AdminChatHeader />
      ) : (
        <ChatHeader
          room={room as ChatRoom & { profile: Profile }}
          onRequestReveal={handleRequestReveal}
          onExpire={handleExpire}
          profileShortId={room.profile?.short_id}
        />
      )}

      {/* Profile revealed card (normal chats only) */}
      {!isAdmin && isCompleted && room.profile_revealed && room.profile && (
        <ProfileRevealedView profile={room.profile} />
      )}

      {/* Reveal request banner (normal chats only) */}
      {!isAdmin && room.reveal_requested_by && !room.profile_revealed && (
        <ProfileRevealBanner
          isRequester={room.reveal_requested_by === user.id}
          onAccept={handleAcceptReveal}
        />
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={user.id}
        isLoading={messagesLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        isAdminChat={isAdmin}
      />

      {/* Input or expired overlay */}
      {isAdmin ? (
        <ChatInput onSend={handleSend} />
      ) : showExpiredOverlay ? (
        <ChatExpiredOverlay status={isExpired ? "expired" : "completed"} />
      ) : showInput ? (
        <ChatInput onSend={handleSend} disabled={!isActive} />
      ) : null}
    </div>
  );
}
