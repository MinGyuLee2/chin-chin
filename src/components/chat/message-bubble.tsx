"use client";

import { cn, formatTime } from "@/lib/utils";
import type { Message } from "@/types/database";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  return (
    <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[75%]", isMine ? "items-end" : "items-start")}>
        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm",
            isMine
              ? "rounded-br-sm bg-primary text-white"
              : "rounded-bl-sm bg-muted text-foreground"
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Meta: time + read status */}
        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-[10px] text-muted-foreground",
            isMine ? "justify-end" : "justify-start"
          )}
        >
          {isMine && message.is_read && (
            <span className="text-secondary">읽음</span>
          )}
          <span>{formatTime(message.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
