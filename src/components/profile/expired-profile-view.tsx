"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";

export function ExpiredProfileView() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted-foreground/10">
            <Clock className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>

        <Logo size="md" asLink={false} className="mb-4" />

        <h1 className="mb-2 text-2xl font-bold">이 소개는 마감되었어요</h1>
        <p className="mb-8 text-muted-foreground">
          24시간이 지나 링크가 만료되었어요.
          <br />
          다른 소개를 찾아보세요!
        </p>

        <div className="space-y-3">
          <Button fullWidth asChild>
            <Link href="/">
              친친 둘러보기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <Button variant="outline" fullWidth asChild>
            <Link href="/create">친구 소개하기</Link>
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
