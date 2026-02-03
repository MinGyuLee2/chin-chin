import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ChatRequestDetail } from "@/components/chat/chat-request-detail";
import type { ChatRoom, Profile } from "@/types/database";

interface Props {
  params: Promise<{ roomId: string }>;
}

export default async function ChatRequestPage({ params }: Props) {
  const { roomId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/chat");

  const { data: roomData } = await supabase
    .from("chat_rooms")
    .select("*, profile:profiles(*)")
    .eq("id", roomId)
    .single();

  if (!roomData) notFound();

  const room = roomData as ChatRoom & { profile: Profile };

  // Only the target can see the request page
  if (room.target_id !== user.id) notFound();

  // If already handled, redirect to chat list
  if (room.status !== "pending") redirect("/chat");

  return <ChatRequestDetail room={room} />;
}
