"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Instagram, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/database";

interface ProfileRevealedViewProps {
  profile: Profile;
}

const TAG_TOPICS: Record<string, string> = {
  "카페투어": "요즘 가본 카페 중 분위기 좋았던 곳 있어요?",
  "전시회": "최근에 본 전시 중 인상 깊었던 거 있어요?",
  "영화": "요즘 본 영화 중 추천해줄 거 있어요?",
  "독서": "요즘 읽고 있는 책 있어요?",
  "운동": "평소에 어떤 운동 즐겨 하세요?",
  "등산": "좋아하는 등산 코스 있어요?",
  "여행": "최근에 다녀온 여행지 중 좋았던 곳 있어요?",
  "요리": "자신 있는 요리가 뭐예요?",
  "음악감상": "요즘 자주 듣는 노래 추천해주세요!",
  "게임": "요즘 어떤 게임 하고 있어요?",
  "반려동물": "반려동물 키우고 있어요? 어떤 아이예요?",
  "사진": "사진 찍을 때 좋아하는 장소가 있어요?",
  "맛집탐방": "요즘 맛집 발견한 곳 있어요?",
  "드라이브": "드라이브할 때 좋아하는 코스가 있어요?",
  "캠핑": "좋아하는 캠핑 스타일이 있어요?",
  "공연관람": "최근에 본 공연 중 좋았던 거 있어요?",
  "와인": "좋아하는 와인 종류가 있어요?",
  "댄스": "어떤 장르의 댄스를 좋아해요?",
  "요가": "요가 시작한 지 얼마나 됐어요?",
  "러닝": "주로 어디서 러닝하세요?",
};

function getConversationTopics(profile: Profile): string[] {
  const topics: string[] = [];

  if (profile.interest_tags) {
    for (const tag of profile.interest_tags) {
      if (TAG_TOPICS[tag]) {
        topics.push(TAG_TOPICS[tag]);
      }
    }
  }

  if (profile.mbti) {
    topics.push(`MBTI가 ${profile.mbti}이시네요! 잘 맞는다고 느끼세요?`);
  }

  if (profile.music_genre) {
    topics.push(`${profile.music_genre} 좋아하시는군요! 좋아하는 아티스트 있어요?`);
  }

  return topics.sort(() => Math.random() - 0.5).slice(0, 3);
}

export function ProfileRevealedView({ profile }: ProfileRevealedViewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const topics = useMemo(() => getConversationTopics(profile), [profile]);

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
          {/* Instagram */}
          <div className="flex flex-wrap gap-2">
            {profile.instagram_id ? (
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
            ) : (
              <p className="text-sm text-muted-foreground">
                등록된 인스타그램 정보가 없어요
              </p>
            )}
          </div>

          {/* Conversation topic suggestions */}
          {topics.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-secondary" />
                <p className="text-xs font-medium text-secondary">이런 대화로 시작해보세요</p>
              </div>
              <div className="space-y-1.5">
                {topics.map((topic, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-white/80 px-3 py-2 text-sm text-foreground"
                  >
                    {topic}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
