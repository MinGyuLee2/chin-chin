"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Instagram, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/database";

interface ProfileRevealedViewProps {
  profile: Profile;
}

export function ProfileRevealedView({ profile }: ProfileRevealedViewProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border-b bg-gradient-to-r from-primary-light to-white"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <Avatar
            src={profile.original_photo_url}
            alt=""
            size="md"
          />
          <div className="text-left">
            <p className="text-sm font-medium">
              {profile.age}세 · {profile.gender === "male" ? "남" : "여"}
              {profile.name && ` · ${profile.name}`}
            </p>
            <p className="text-xs text-primary">프로필이 공개되었어요</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="overflow-hidden px-4 pb-3"
        >
          <div className="flex flex-wrap gap-2">
            {profile.instagram_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://instagram.com/${profile.instagram_id}`,
                    "_blank"
                  )
                }
              >
                <Instagram className="mr-1.5 h-4 w-4" />
                @{profile.instagram_id}
              </Button>
            )}
            {profile.kakao_open_chat_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(profile.kakao_open_chat_id!, "_blank")
                }
              >
                <MessageSquare className="mr-1.5 h-4 w-4" />
                카카오톡 오픈채팅
              </Button>
            )}
            {!profile.instagram_id && !profile.kakao_open_chat_id && (
              <p className="text-sm text-muted-foreground">
                등록된 연락처 정보가 없어요
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
