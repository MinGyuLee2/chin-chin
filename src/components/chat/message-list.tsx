"use client";

import { useCallback, useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { formatDate } from "@/lib/utils";
import type { Message } from "@/types/database";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function MessageList({
  messages,
  currentUserId,
  isLoading,
  hasMore,
  onLoadMore,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  // Auto-scroll to bottom on initial load and new messages
  useEffect(() => {
    if (messages.length === 0) return;

    const isNewMessage = messages.length > prevMessageCountRef.current;
    const wasLoadMore =
      messages.length - prevMessageCountRef.current > 1 &&
      !isInitialLoadRef.current;

    if (isInitialLoadRef.current || (isNewMessage && !wasLoadMore)) {
      bottomRef.current?.scrollIntoView({ behavior: isInitialLoadRef.current ? "instant" : "smooth" });
      isInitialLoadRef.current = false;
    }

    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  // Infinite scroll observer for loading older messages
  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(observerCallback, {
      root: scrollContainerRef.current,
      threshold: 0.1,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [observerCallback]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <p className="text-sm">첫 메시지를 보내보세요!</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto px-4 py-3"
    >
      {/* Load more sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}

      {/* Messages grouped by date */}
      <div className="space-y-2">
        {messages.map((message, index) => {
          const showDateSeparator =
            index === 0 ||
            !isSameDay(message.created_at, messages[index - 1].created_at);

          return (
            <div key={message.id}>
              {showDateSeparator && (
                <div className="flex items-center justify-center py-3">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    {formatDate(message.created_at)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={message}
                isMine={message.sender_id === currentUserId}
              />
            </div>
          );
        })}
      </div>

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
