"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { useToast } from "@/components/ui/toaster";
import { createInvitation } from "./actions";

export default function CreateInvitePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const result = await createInvitation(message || undefined);

      if (result.error) {
        toast({
          title: "오류",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      router.push(`/create/invite/complete?id=${result.invitationId}&code=${result.inviteCode}`);
    } catch {
      toast({
        title: "오류",
        description: "초대 링크 생성에 실패했어요. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white px-4 py-8">
        <div className="mx-auto max-w-lg">
          <button
            onClick={() => router.back()}
            className="mb-6 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="mb-2 text-2xl font-bold tracking-tight">
              친구를 초대해서 소개하기
            </h1>
            <p className="mb-8 text-muted-foreground">
              초대 링크를 만들어 친구에게 보내세요. 친구가 직접 프로필을 작성하면 알려드릴게요!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Message input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                친구에게 보낼 메시지 (선택)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="예: 소개팅 프로필 작성해줘! 내가 인스타에 올려줄게 😊"
                maxLength={200}
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {message.length}/200
              </p>
            </div>

            {/* How it works */}
            <div className="rounded-xl bg-gray-50 p-4">
              <h3 className="mb-3 text-sm font-bold text-gray-700">이렇게 진행돼요</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
                  초대 링크를 친구에게 전달해요
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
                  친구가 링크를 열고 본인 프로필을 작성해요
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
                  작성 완료 알림을 받으면 인스타에 공유해요
                </li>
              </ol>
            </div>

            {/* Submit button */}
            <Button
              fullWidth
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  초대 링크 만들기
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </main>
    </>
  );
}
