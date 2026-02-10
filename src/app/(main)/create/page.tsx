"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Pen } from "lucide-react";
import { Header } from "@/components/layout/header";

export default function CreateHubPage() {
  const router = useRouter();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white px-4 py-8">
        <div className="mx-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold tracking-tight">
              어떻게 소개할까요?
            </h1>
            <p className="mt-1 text-muted-foreground">
              원하는 방식을 선택해주세요
            </p>
          </motion.div>

          <div className="space-y-4">
            {/* Option 1: Invite friend */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => router.push("/create/invite")}
              className="w-full rounded-2xl border border-gray-200 p-6 text-left transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h2 className="mb-1 text-lg font-bold">친구를 초대해서 소개하기</h2>
              <p className="text-sm text-muted-foreground">
                친구에게 링크를 보내면 친구가 직접 프로필을 작성해요. 작성이 완료되면 인스타에 공유하세요!
              </p>
            </motion.button>

            {/* Option 2: Self profile */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => router.push("/create/self")}
              className="w-full rounded-2xl border border-gray-200 p-6 text-left transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Pen className="h-6 w-6 text-primary" />
              </div>
              <h2 className="mb-1 text-lg font-bold">내 프로필 직접 만들기</h2>
              <p className="text-sm text-muted-foreground">
                직접 프로필을 작성하고 지인에게 공유해요. 바로 매칭이 시작돼요!
              </p>
            </motion.button>
          </div>
        </div>
      </main>
    </>
  );
}
