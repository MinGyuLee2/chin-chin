"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  Share2,
  Instagram,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { CountdownTimer } from "@/components/common/countdown-timer";
import { Logo } from "@/components/common/logo";
import { useToast } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/client";
import { getProfileUrl } from "@/lib/utils";
import type { Profile } from "@/types/database";

export default function SelfCompletePageWrapper() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SelfCompleteContent />
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

function SelfCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const profileId = searchParams.get("id");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profileId) {
      router.push("/create");
      return;
    }

    async function fetchProfile() {
      if (!profileId) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error || !data) {
        router.push("/create");
        return;
      }

      setProfile(data as Profile);
      setIsLoading(false);
    }

    fetchProfile();
  }, [profileId, router]);

  const profileUrl = profile ? getProfileUrl(profile.short_id) : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({
        title: "복사 완료",
        description: "링크가 클립보드에 복사되었어요",
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
          title: "친친 - 소개팅 프로필",
          text: `${profile?.bio} 💕`,
          url: profileUrl,
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

  const handleInstagramShare = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
    } catch {
      // clipboard may fail silently
    }

    toast({
      title: "링크가 복사되었어요!",
      description: "스토리에서 링크 스티커를 추가하고 붙여넣기 하세요 📎",
      variant: "success",
    });

    setTimeout(() => {
      window.open("instagram://story-camera", "_blank");
    }, 500);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!profile) {
    return null;
  }

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
            <h1 className="mb-2 text-2xl font-bold">프로필이 생성되었어요!</h1>
            <p className="text-muted-foreground">
              지인에게 이 링크를 공유해보세요. 24시간 후 만료돼요!
            </p>
          </motion.div>

          {/* Profile preview card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="mb-6 overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={profile.photo_url}
                  alt="Profile"
                  fill
                  sizes="(max-width: 768px) 100vw, 448px"
                  className="object-cover blur-xl"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Logo size="md" asLink={false} />
                </div>
              </div>
              <CardContent className="p-4">
                <p className="mb-2 font-medium">{profile.bio}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {profile.age}세 · {profile.gender === "male" ? "남" : "여"}
                  </span>
                  <span>·</span>
                  <CountdownTimer expiresAt={profile.expires_at} size="sm" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Link display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 rounded-xl bg-muted p-4">
              <div className="flex-1 truncate font-mono text-sm">
                {profileUrl}
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
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Button
              fullWidth
              size="lg"
              onClick={handleInstagramShare}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90"
            >
              <Instagram className="mr-2 h-5 w-5" />
              인스타 스토리에 공유하기
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

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => window.open(profileUrl, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                미리보기
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => router.push("/create")}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                새 프로필 만들기
              </Button>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 rounded-xl bg-white p-4 shadow-soft"
          >
            <h3 className="mb-2 font-bold">💡 공유 팁</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 지인에게 링크를 보내서 인스타 스토리에 올려달라고 해보세요</li>
              <li>• 링크 스티커를 사용하면 터치 한 번으로 접속할 수 있어요</li>
              <li>• 24시간 후 링크가 만료되니 서둘러 공유하세요!</li>
            </ul>
          </motion.div>
        </div>
      </main>
    </>
  );
}
