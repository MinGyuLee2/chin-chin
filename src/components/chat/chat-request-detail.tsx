"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/common/tag";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toaster";
import {
  acceptChatRequest,
  rejectChatRequest,
} from "@/app/(main)/chat/[roomId]/actions";
import type { ChatRoom, Profile } from "@/types/database";

interface ChatRequestDetailProps {
  room: ChatRoom & { profile: Profile };
}

export function ChatRequestDetail({ room }: ChatRequestDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const profile = room.profile;

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const result = await acceptChatRequest(room.id);
      if (result.error) {
        toast({
          title: "오류",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "대화가 시작되었어요!",
        description: "상대방과 대화를 나눠보세요",
        variant: "success",
      });
      router.push(`/chat/${room.id}`);
    } catch {
      toast({
        title: "오류",
        description: "수락에 실패했어요. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const result = await rejectChatRequest(room.id);
      if (result.error) {
        toast({
          title: "오류",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "거절 완료",
        description: "대화 신청을 거절했어요",
      });
      router.push("/chat");
    } catch {
      toast({
        title: "오류",
        description: "거절에 실패했어요. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
      setShowRejectDialog(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-muted to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-white/80 px-4 py-3 backdrop-blur-soft">
        <button onClick={() => router.push("/chat")} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-medium">대화 신청</h1>
      </header>

      <div className="mx-auto max-w-lg px-4 pb-32">
        {/* Profile Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-6 mt-4 aspect-square overflow-hidden rounded-3xl shadow-strong"
        >
          <img
            src={profile.photo_url}
            alt="Profile"
            className="h-full w-full object-cover blur-xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </motion.div>

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Basic info */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{profile.age}세</span>
            <span className="text-2xl text-muted-foreground">·</span>
            <span className="text-2xl">
              {profile.gender === "male" ? "남성" : "여성"}
            </span>
            {profile.occupation_category && (
              <>
                <span className="text-2xl text-muted-foreground">·</span>
                <span className="text-lg text-muted-foreground">
                  {profile.occupation_category}
                </span>
              </>
            )}
          </div>

          {/* Bio */}
          <p className="text-xl leading-relaxed">{profile.bio}</p>

          {/* Interest tags */}
          <div className="flex flex-wrap gap-2">
            {profile.interest_tags.map((tag) => (
              <Tag key={tag} variant="primary" size="md">
                #{tag}
              </Tag>
            ))}
          </div>

          {/* Optional info */}
          <div className="flex flex-wrap gap-3 text-muted-foreground">
            {profile.mbti && (
              <span className="rounded-lg bg-muted px-3 py-1 text-sm">
                {profile.mbti}
              </span>
            )}
            {profile.music_genre && (
              <span className="rounded-lg bg-muted px-3 py-1 text-sm">
                {profile.music_genre}
              </span>
            )}
          </div>

          {/* Hint */}
          <div className="rounded-xl bg-primary-light p-4 text-center">
            <p className="text-sm text-primary">
              이 분이 대화를 신청했어요. 수락하시겠어요?
            </p>
          </div>
        </motion.div>
      </div>

      {/* Fixed bottom buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 bg-white/95 px-4 py-4 shadow-strong backdrop-blur-soft safe-bottom"
      >
        <div className="mx-auto flex max-w-lg gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => setShowRejectDialog(true)}
            disabled={isAccepting}
          >
            거절하기
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={handleAccept}
            loading={isAccepting}
          >
            수락하기
          </Button>
        </div>
      </motion.div>

      {/* Reject confirmation dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="mx-4 max-w-sm">
          <DialogHeader>
            <DialogTitle>대화 신청을 거절하시겠어요?</DialogTitle>
            <DialogDescription>
              거절하면 이 프로필에서 다시 대화 신청을 받을 수 없어요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowRejectDialog(false)}
              disabled={isRejecting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleReject}
              loading={isRejecting}
            >
              거절하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
