"use client";

import { Clock, Heart } from "lucide-react";

interface ChatExpiredOverlayProps {
  status: "expired" | "completed";
}

export function ChatExpiredOverlay({ status }: ChatExpiredOverlayProps) {
  return (
    <div className="border-t bg-muted/50 px-4 py-4 safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-center gap-2 text-sm text-muted-foreground">
        {status === "expired" ? (
          <>
            <Clock className="h-4 w-4" />
            <span>대화가 만료되었어요</span>
          </>
        ) : (
          <>
            <Heart className="h-4 w-4 text-primary" />
            <span>프로필이 공개되었어요. 연락처를 확인해보세요!</span>
          </>
        )}
      </div>
    </div>
  );
}
