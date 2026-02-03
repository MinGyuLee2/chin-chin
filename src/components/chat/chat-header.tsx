"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/common/countdown-timer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ChatRoom, Profile } from "@/types/database";

interface ChatHeaderProps {
  room: ChatRoom & { profile: Profile };
  currentUserId: string;
  onRequestReveal: () => Promise<void>;
  onExpire?: () => void;
}

export function ChatHeader({
  room,
  currentUserId,
  onRequestReveal,
  onExpire,
}: ChatHeaderProps) {
  const router = useRouter();
  const [showRevealDialog, setShowRevealDialog] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const profile = room.profile;
  const canRequestReveal =
    room.status === "active" &&
    !room.profile_revealed &&
    !room.reveal_requested_by;

  const handleRevealRequest = async () => {
    setIsRequesting(true);
    try {
      await onRequestReveal();
    } finally {
      setIsRequesting(false);
      setShowRevealDialog(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b bg-white px-3 py-2">
        {/* Back button */}
        <button onClick={() => router.push("/chat")} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Profile info */}
        <Avatar
          src={
            room.profile_revealed
              ? profile.original_photo_url
              : profile.photo_url
          }
          alt=""
          size="sm"
          blurred={!room.profile_revealed}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {profile.age}세 · {profile.gender === "male" ? "남" : "여"}
          </p>
        </div>

        {/* Timer or reveal button */}
        <div className="flex items-center gap-2">
          {room.status === "active" && room.expires_at && (
            <CountdownTimer
              expiresAt={room.expires_at}
              size="sm"
              onExpire={onExpire}
            />
          )}
          {canRequestReveal && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRevealDialog(true)}
              className="text-primary"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Reveal confirmation dialog */}
      <Dialog open={showRevealDialog} onOpenChange={setShowRevealDialog}>
        <DialogContent className="mx-4 max-w-sm">
          <DialogHeader>
            <DialogTitle>프로필 공개를 요청하시겠어요?</DialogTitle>
            <DialogDescription>
              상대방이 수락하면 서로의 프로필이 공개돼요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowRevealDialog(false)}
              disabled={isRequesting}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={handleRevealRequest}
              loading={isRequesting}
            >
              요청하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
