"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileRevealBannerProps {
  isRequester: boolean;
  onAccept: () => Promise<void>;
}

export function ProfileRevealBanner({
  isRequester,
  onAccept,
}: ProfileRevealBannerProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept();
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b bg-amber-50 px-4 py-3"
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <Eye className="h-5 w-5 shrink-0 text-amber-600" />
        {isRequester ? (
          <p className="flex-1 text-sm text-amber-800">
            프로필 공개를 요청했어요. 상대방의 응답을 기다려주세요.
          </p>
        ) : (
          <>
            <p className="flex-1 text-sm text-amber-800">
              상대방이 프로필 공개를 요청했어요
            </p>
            <Button
              size="sm"
              onClick={handleAccept}
              loading={isAccepting}
            >
              수락
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}
