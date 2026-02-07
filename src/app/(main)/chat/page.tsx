"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, Clock, Check, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/common/tag";
import { CountdownTimer } from "@/components/common/countdown-timer";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useToast } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils";
import type { ChatRoom, Profile, Message } from "@/types/database";

interface ChatRoomWithDetails extends ChatRoom {
  profile: Profile | null;
  lastMessage?: Message;
  otherUserNickname?: string;
}

type TabType = "active" | "pending" | "received";

import React from "react";

class ChatErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <Header />
          <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="text-4xl mb-4">😵</div>
            <h2 className="text-lg font-bold mb-2">오류가 발생했어요</h2>
            <p className="text-muted-foreground text-center mb-4">
              {this.state.error?.message || "알 수 없는 오류"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-primary text-white rounded-xl"
            >
              다시 시도
            </button>
          </main>
          <BottomNav />
        </>
      );
    }
    return this.props.children;
  }
}

export default function ChatListPage() {
  return (
    <ChatErrorBoundary>
      <Suspense fallback={<ChatLoadingState />}>
        <ChatListContent />
      </Suspense>
    </ChatErrorBoundary>
  );
}

function ChatLoadingState() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
      <BottomNav />
    </>
  );
}

function ChatListContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [chatRooms, setChatRooms] = useState<ChatRoomWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("active");

  // Check for success message from chat request
  useEffect(() => {
    const requested = searchParams.get("requested");
    if (requested) {
      toast({
        title: "대화 신청 완료!",
        description: "상대방의 응답을 기다려주세요",
        variant: "success",
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (!user) return;

    async function fetchChatRooms() {
      const supabase = createClient();

      // Fetch chat rooms where user is either requester or target
      const { data: rooms, error } = await supabase
        .from("chat_rooms")
        .select(
          `
          *,
          profile:profiles(*)
        `
        )
        .or(`requester_id.eq.${user!.id},target_id.eq.${user!.id}`)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching chat rooms:", error);
        setIsLoading(false);
        return;
      }

      // Fetch blocked user IDs
      const { data: blocksData } = await supabase
        .from("blocks")
        .select("blocked_id")
        .eq("blocker_id", user!.id);

      const blockedIds = new Set(
        (blocksData || []).map((b: { blocked_id: string }) => b.blocked_id)
      );

      // Filter out blocked users
      const filteredRoomList = (rooms || []).filter(
        (room: ChatRoom) => {
          const otherId =
            room.requester_id === user!.id
              ? room.target_id
              : room.requester_id;
          return !blockedIds.has(otherId);
        }
      );

      // Batch fetch last messages for all rooms in a single query
      const roomIds = filteredRoomList.map((r: { id: string }) => r.id);
      const lastMessages: Record<string, Message> = {};

      if (roomIds.length > 0) {
        const { data: allMessages } = await supabase
          .from("messages")
          .select("*")
          .in("room_id", roomIds)
          .order("created_at", { ascending: false });

        // Group by room_id, keep only the first (latest) message per room
        if (allMessages) {
          for (const msg of allMessages as Message[]) {
            if (!lastMessages[msg.room_id]) {
              lastMessages[msg.room_id] = msg;
            }
          }
        }
      }

      const roomsWithMessages = filteredRoomList.map(
        (room: { id: string; profile: Profile } & ChatRoom) => ({
          ...room,
          lastMessage: lastMessages[room.id],
        })
      );

      setChatRooms(roomsWithMessages as ChatRoomWithDetails[]);
      setIsLoading(false);
    }

    fetchChatRooms();

    // Subscribe to realtime updates
    const supabase = createClient();
    const channel = supabase
      .channel("chat_rooms_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_rooms",
        },
        () => {
          fetchChatRooms();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchChatRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filterRooms = (rooms: ChatRoomWithDetails[], tab: TabType) => {
    return rooms.filter((room) => {
      // profile이 없는 방은 제외
      if (!room.profile) return false;

      const isRequester = room.requester_id === user?.id;

      switch (tab) {
        case "active":
          return room.status === "active" || room.status === "completed";
        case "pending":
          // Requests I sent that are pending
          return room.status === "pending" && isRequester;
        case "received":
          // Requests I received that are pending
          return room.status === "pending" && !isRequester;
        default:
          return true;
      }
    });
  };

  const filteredRooms = filterRooms(chatRooms, activeTab);
  const pendingReceived = filterRooms(chatRooms, "received").length;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-muted pb-24">
        {/* Tabs */}
        <div className="sticky top-14 z-30 bg-white shadow-soft">
          <div className="mx-auto flex max-w-lg">
            {[
              { key: "active" as const, label: "대화중", icon: MessageCircle },
              { key: "pending" as const, label: "대기중", icon: Clock },
              {
                key: "received" as const,
                label: "신청받음",
                icon: Inbox,
                badge: pendingReceived,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab(tab.key);
                }}
                className={`relative flex flex-1 items-center justify-center gap-2 border-b-[3px] px-4 py-3 text-sm font-medium transition-all duration-200 ${activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-foreground"
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat list */}
        <div className="px-4 py-4">
          <div className="mx-auto max-w-lg space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="h-14 w-14 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 rounded bg-muted" />
                        <div className="h-3 w-1/3 rounded bg-muted" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mb-4 text-4xl">
                  {activeTab === "active"
                    ? "💬"
                    : activeTab === "pending"
                      ? "⏳"
                      : "📥"}
                </div>
                <p className="mb-2 font-medium">
                  {activeTab === "active"
                    ? "진행 중인 대화가 없어요"
                    : activeTab === "pending"
                      ? "대기 중인 신청이 없어요"
                      : "받은 신청이 없어요"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "active"
                    ? "프로필을 둘러보고 대화를 신청해보세요"
                    : activeTab === "pending"
                      ? "관심 있는 프로필에 대화를 신청해보세요"
                      : "친구에게 프로필을 공유해서 신청을 받아보세요"}
                </p>
              </div>
            ) : (
              filteredRooms.map((room, index) => (
                <ChatRoomCard
                  key={room.id}
                  room={room}
                  currentUserId={user?.id || ""}
                  index={index}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}

function ChatRoomCard({
  room,
  currentUserId,
  index,
}: {
  room: ChatRoomWithDetails;
  currentUserId: string;
  index: number;
}) {
  const isRequester = room.requester_id === currentUserId;
  const profile = room.profile;

  // profile이 없으면 렌더링하지 않음
  if (!profile) {
    return null;
  }

  const getStatusBadge = () => {
    switch (room.status) {
      case "pending":
        return isRequester ? (
          <Tag variant="muted" size="sm">
            응답 대기중
          </Tag>
        ) : (
          <Tag variant="primary" size="sm">
            신청 받음
          </Tag>
        );
      case "active":
        return room.expires_at ? (
          <CountdownTimer expiresAt={room.expires_at} size="sm" />
        ) : null;
      case "rejected":
        return (
          <Tag variant="muted" size="sm">
            거절됨
          </Tag>
        );
      case "expired":
        return (
          <Tag variant="muted" size="sm">
            만료됨
          </Tag>
        );
      case "completed":
        return (
          <Tag variant="secondary" size="sm">
            프로필 공개됨
          </Tag>
        );
      default:
        return null;
    }
  };

  const href =
    room.status === "active" || room.status === "completed"
      ? `/chat/${room.id}`
      : room.status === "pending" && !isRequester
        ? `/chat/request/${room.id}`
        : "#";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={href}>
        <Card className="transition-shadow hover:shadow-medium">
          <CardContent className="flex items-center gap-3 p-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar
                src={profile.photo_url}
                alt=""
                size="lg"
                blurred={!room.profile_revealed}
              />
              {room.profile_revealed && (
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {profile.age}세 · {profile.gender === "male" ? "남" : "여"}
                </span>
                {getStatusBadge()}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {room.lastMessage
                  ? room.lastMessage.content
                  : room.status === "pending"
                    ? isRequester
                      ? "대화 신청을 보냈어요"
                      : "대화 신청이 도착했어요"
                    : profile.bio}
              </p>
            </div>

            {/* Time */}
            <div className="shrink-0 text-xs text-muted-foreground">
              {room.lastMessage
                ? formatRelativeTime(room.lastMessage.created_at)
                : formatRelativeTime(room.created_at)}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
