"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, MoreVertical, Flag, Ban } from "lucide-react";
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
import { ReportDialog } from "@/components/chat/report-dialog";
import { useToast } from "@/components/ui/toaster";
import { reportUser, blockUser } from "@/app/(main)/chat/[roomId]/actions";
import type { ChatRoom, Profile } from "@/types/database";

interface ChatHeaderProps {
  room: ChatRoom & { profile: Profile };
  onRequestReveal: () => Promise<void>;
  onExpire?: () => void;
  profileShortId?: string;
}

export function ChatHeader({
  room,
  onRequestReveal,
  onExpire,
  profileShortId,
}: ChatHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showRevealDialog, setShowRevealDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

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

  const handleReport = useCallback(
    async (reason: string, description?: string) => {
      const result = await reportUser(room.id, reason, description);
      if (result.error) {
        toast({
          title: "신고 실패",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "신고 완료",
        description: "신고가 접수되었어요. 검토 후 조치할게요.",
        variant: "success",
      });
      setShowReportDialog(false);
    },
    [room.id, toast]
  );

  const handleBlock = async () => {
    setIsBlocking(true);
    try {
      const result = await blockUser(room.id);
      if (result.error) {
        toast({
          title: "차단 실패",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "차단 완료",
        description: "해당 사용자를 차단했어요.",
        variant: "success",
      });
      router.push("/chat");
    } finally {
      setIsBlocking(false);
      setShowBlockDialog(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] bg-white px-3 py-2">
        {/* Back button */}
        <button onClick={() => router.push("/chat")} className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-50">
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Profile info — clickable when shortId available */}
        <button
          onClick={() => profileShortId && router.push(`/m/${profileShortId}`)}
          disabled={!profileShortId}
          className="flex flex-1 items-center gap-3 min-w-0 disabled:cursor-default"
        >
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
        </button>

        {/* Timer or reveal button */}
        <div className="flex items-center gap-1">
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

          {/* More menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-50"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border bg-white py-1 shadow-lg">
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted"
                    onClick={() => {
                      setShowMenu(false);
                      setShowReportDialog(true);
                    }}
                  >
                    <Flag className="h-4 w-4" />
                    신고하기
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-muted"
                    onClick={() => {
                      setShowMenu(false);
                      setShowBlockDialog(true);
                    }}
                  >
                    <Ban className="h-4 w-4" />
                    차단하기
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Reveal confirmation dialog */}
      <Dialog open={showRevealDialog} onOpenChange={setShowRevealDialog}>
        <DialogContent>
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

      {/* Block confirmation dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이 사용자를 차단하시겠어요?</DialogTitle>
            <DialogDescription>
              차단하면 이 채팅방이 종료되고, 해당 사용자와 더 이상 대화할 수
              없어요. 대시보드에서 차단을 해제할 수 있어요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowBlockDialog(false)}
              disabled={isBlocking}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleBlock}
              loading={isBlocking}
            >
              차단하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report dialog */}
      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        onSubmit={handleReport}
      />
    </>
  );
}
