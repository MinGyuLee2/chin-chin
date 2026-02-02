"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/common/tag";
import { CountdownTimer } from "@/components/common/countdown-timer";
import { Logo } from "@/components/common/logo";
import { useToast } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { requestChat } from "@/app/m/[shortId]/actions";
import { getProfileUrl } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface BlindProfileViewProps {
  profile: Profile;
}

export function BlindProfileView({ profile }: BlindProfileViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleChatRequest = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/m/${profile.short_id}`);
      return;
    }

    // Check if user is the creator
    if (user?.id === profile.creator_id) {
      toast({
        title: "알림",
        description: "본인이 만든 프로필에는 신청할 수 없어요",
        variant: "destructive",
      });
      return;
    }

    setIsRequesting(true);

    try {
      const result = await requestChat(profile.id);

      if (result.error) {
        toast({
          title: "오류",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "대화 신청 완료!",
        description: "상대방이 수락하면 대화를 시작할 수 있어요",
        variant: "success",
      });

      // Redirect to chat waiting room or confirmation
      router.push(`/chat?requested=${profile.id}`);
    } catch {
      toast({
        title: "오류",
        description: "대화 신청에 실패했어요. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleShare = async () => {
    const url = getProfileUrl(profile.short_id);

    if (navigator.share) {
      try {
        await navigator.share({
          title: "친친 - 이 친구 어때요?",
          text: profile.bio,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "링크 복사됨",
        description: "친구에게 공유해보세요!",
        variant: "success",
      });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-muted to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white/80 px-4 py-3 backdrop-blur-soft">
        <Logo size="sm" />
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
        </Button>
      </header>

      <div className="mx-auto max-w-lg px-4 pb-32">
        {/* Profile Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-6 aspect-square overflow-hidden rounded-3xl shadow-strong"
        >
          <img
            src={profile.photo_url}
            alt="Profile"
            className="h-full w-full object-cover blur-xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Stats overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm">{profile.view_count}명이 봤어요</span>
            </div>
            <CountdownTimer
              expiresAt={profile.expires_at}
              size="sm"
              className="text-white"
            />
          </div>
        </motion.div>

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          {/* Basic info */}
          <div className="mb-4 flex items-center gap-2">
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
          <p className="mb-6 text-xl leading-relaxed">{profile.bio}</p>

          {/* Interest tags */}
          <div className="mb-4 flex flex-wrap gap-2">
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
                🎵 {profile.music_genre}
              </span>
            )}
          </div>
        </motion.div>

        {/* Creator info hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 rounded-xl bg-primary-light p-4 text-center"
        >
          <p className="text-sm text-primary">
            💕 친구가 직접 소개해준 프로필이에요
          </p>
        </motion.div>
      </div>

      {/* Fixed bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 bg-white/95 px-4 py-4 shadow-strong backdrop-blur-soft safe-bottom"
      >
        <div className="mx-auto max-w-lg">
          <Button
            fullWidth
            size="lg"
            onClick={handleChatRequest}
            loading={isRequesting}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            대화 신청하기
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            상대방이 수락하면 익명 채팅이 시작돼요
          </p>
        </div>
      </motion.div>
    </main>
  );
}
