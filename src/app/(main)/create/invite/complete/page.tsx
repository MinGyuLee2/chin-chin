"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Copy, Share2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { useToast } from "@/components/ui/toaster";

export default function InviteCompletePageWrapper() {
  return (
    <Suspense fallback={<LoadingState />}>
      <InviteCompleteContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    </>
  );
}

function InviteCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const inviteCode = searchParams.get("code");

  const [copied, setCopied] = useState(false);

  if (!inviteCode) {
    router.push("/create");
    return null;
  }

  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${inviteCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast({
        title: "복사 완료",
        description: "초대 링크가 클립보드에 복사되었어요",
        variant: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "복사 실패",
        description: "링크 복사에 실패했어요",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "친친 - 소개팅 프로필 작성 초대",
          text: "소개팅 프로필을 작성해줘! 내가 인스타에 올려줄게 💕",
          url: inviteUrl,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-b from-primary-light to-white px-4 py-8">
        <div className="mx-auto max-w-lg">
          {/* Success animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mb-6 flex justify-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
              <Check className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 text-center"
          >
            <h1 className="mb-2 text-2xl font-bold">초대 링크가 생성되었어요!</h1>
            <p className="text-muted-foreground">
              친구에게 이 링크를 보내세요. 친구가 프로필을 작성하면 알려드릴게요!
            </p>
          </motion.div>

          {/* Link display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 rounded-xl bg-muted p-4">
              <div className="flex-1 truncate font-mono text-sm">
                {inviteUrl}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <Button fullWidth size="lg" onClick={handleCopy}>
              <Copy className="mr-2 h-5 w-5" />
              링크 복사하기
            </Button>

            <Button
              fullWidth
              size="lg"
              variant="outline"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-5 w-5" />
              다른 방법으로 공유하기
            </Button>

            <Button
              variant="ghost"
              fullWidth
              onClick={() => router.push("/dashboard")}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              대시보드에서 확인하기
            </Button>
          </motion.div>

          {/* Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 rounded-xl bg-white p-4 shadow-soft"
          >
            <h3 className="mb-2 font-bold">💡 안내</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 초대 링크는 7일간 유효해요</li>
              <li>• 친구가 프로필을 작성하면 알림을 보내드려요</li>
              <li>• 대시보드에서 초대 상태를 확인할 수 있어요</li>
            </ul>
          </motion.div>
        </div>
      </main>
    </>
  );
}
