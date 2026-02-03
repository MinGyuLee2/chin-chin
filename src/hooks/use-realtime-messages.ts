"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types/database";

const PAGE_SIZE = 30;

interface UseRealtimeMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  addMessage: (message: Message) => void;
}

export function useRealtimeMessages(
  roomId: string,
  currentUserId: string
): UseRealtimeMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const supabaseRef = useRef(createClient());
  const loadingMoreRef = useRef(false);

  // Initial fetch
  useEffect(() => {
    async function fetchInitial() {
      setIsLoading(true);
      const { data, error } = await supabaseRef.current
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (error) {
        console.error("Fetch messages error:", error);
        setIsLoading(false);
        return;
      }

      const msgs = (data as Message[]) || [];
      // Reverse so oldest first for display
      setMessages(msgs.reverse());
      setHasMore(msgs.length === PAGE_SIZE);
      setIsLoading(false);
    }

    fetchInitial();
  }, [roomId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabaseRef.current
      .channel(`messages:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabaseRef.current.removeChannel(channel);
    };
  }, [roomId]);

  // Load older messages
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || messages.length === 0) return;
    loadingMoreRef.current = true;

    const oldestMessage = messages[0];

    const { data, error } = await supabaseRef.current
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .lt("created_at", oldestMessage.created_at)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (error) {
      console.error("Load more messages error:", error);
      loadingMoreRef.current = false;
      return;
    }

    const olderMsgs = (data as Message[]) || [];
    setMessages((prev) => [...olderMsgs.reverse(), ...prev]);
    setHasMore(olderMsgs.length === PAGE_SIZE);
    loadingMoreRef.current = false;
  }, [roomId, hasMore, messages]);

  // Optimistic add (for immediate display after sending)
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  return { messages, isLoading, hasMore, loadMore, addMessage };
}
