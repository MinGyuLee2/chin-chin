"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  MessageCircle,
  Share2,

  Users,
  X,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAuth } from "@/hooks/use-auth";

// ─── Data ────────────────────────────────────────────────

const steps = [
  {
    icon: Users,
    title: "친구 프로필 만들기",
    description: "친구의 매력을 담은 블라인드 프로필을 만들어요",
  },
  {
    icon: Share2,
    title: "스토리에 공유하기",
    description: "인스타 스토리에 링크를 올려 친구를 소개해요",
  },
  {
    icon: MessageCircle,
    title: "익명으로 대화하기",
    description: "관심 있는 사람과 블라인드로 대화를 나눠요",
  },
  {
    icon: Heart,
    title: "서로 마음이 맞으면",
    description: "프로필을 공개하고 실제로 연결돼요",
  },
];

const features = [
  {
    title: "앱 설치 없이",
    description: "웹 링크 하나로 바로 시작",
  },
  {
    title: "친구가 보증하는",
    description: "신뢰할 수 있는 소개",
  },
  {
    title: "대화가 먼저",
    description: "외모보다 성격으로",
  },
  {
    title: "24시간 한정",
    description: "지금 아니면 놓쳐요",
  },
];

const mockProfiles = [
  {
    age: 25,
    gender: "여",
    occupation: "디자인",
    bio: "전시 보고 카페 가는 게 주말 루틴이에요",
    tags: ["카페투어", "전시회", "사진"],
    mbti: "INFP",
    gradient: "from-pink-300 to-rose-400",
  },
  {
    age: 28,
    gender: "남",
    occupation: "IT/개발",
    bio: "운동 좋아하고 맛집 찾아다녀요",
    tags: ["운동", "맛집탐방", "여행"],
    mbti: "ENFP",
    gradient: "from-blue-300 to-indigo-400",
  },
  {
    age: 26,
    gender: "여",
    occupation: "마케팅/광고",
    bio: "영화 보고 와인 마시면서 수다 떠는 거 좋아요",
    tags: ["영화", "와인", "공연관람"],
    mbti: "ESFJ",
    gradient: "from-violet-300 to-purple-400",
  },
];

const testimonials = [
  {
    text: "친구가 대신 프로필 만들어줘서 부담 없이 시작했는데, 진짜 잘 맞는 사람 만났어요!",
    author: "25세 · 디자이너",
    emoji: "😍",
  },
  {
    text: "소개팅앱은 부담스러웠는데 친구가 소개해주니까 믿음이 가더라고요. 지금 3개월째 만나는 중!",
    author: "28세 · 개발자",
    emoji: "🥰",
  },
  {
    text: "블라인드로 대화 먼저 하니까 외모 프리셔 없이 편하게 얘기할 수 있어서 좋았어요.",
    author: "27세 · 마케터",
    emoji: "💬",
  },
  {
    text: "인스타 스토리에 링크 올렸더니 친구한테 대화 신청이 3개나 왔어요. 인기 실감 ㅎㅎ",
    author: "24세 · 대학생",
    emoji: "🔥",
  },
];

const stats = [
  { label: "누적 프로필 생성", value: 2847, suffix: "개" },
  { label: "매칭 성공", value: 512, suffix: "쌍" },
  { label: "오늘 진행 중인 대화", value: 1234, suffix: "건" },
  { label: "평균 매칭률", value: 38, suffix: "%" },
];

const comparisons = [
  {
    label: "소개 방식",
    traditional: "알고리즘 매칭",
    chinchin: "친구가 직접 소개",
  },
  {
    label: "신뢰도",
    traditional: "프로필 검증 어려움",
    chinchin: "친구가 보증",
  },
  {
    label: "첫 인상",
    traditional: "사진으로 판단",
    chinchin: "대화로 먼저 알아가기",
  },
  {
    label: "시작 방법",
    traditional: "앱 설치 필요",
    chinchin: "링크 하나로 바로",
  },
  {
    label: "부담감",
    traditional: "직접 올리는 셀카",
    chinchin: "친구가 대신 만들어줌",
  },
];

const faqs = [
  {
    q: "정말 무료인가요?",
    a: "네, 친친의 모든 기능은 무료예요. 프로필 만들기, 대화 신청, 블라인드 해제까지 전부 무료로 이용할 수 있어요.",
  },
  {
    q: "개인정보는 안전한가요?",
    a: "물론이에요. 블라인드 상태에서는 이름, 사진, 연락처가 절대 공개되지 않아요. 서로 동의한 경우에만 프로필이 공개돼요.",
  },
  {
    q: "블라인드 해제는 언제 되나요?",
    a: "대화 중 한쪽이 프로필 공개를 요청하고, 상대방도 동의하면 서로의 프로필이 공개돼요. 양쪽 모두 동의해야만 해제됩니다.",
  },
  {
    q: "프로필 링크는 얼마나 유효한가요?",
    a: "프로필 링크는 생성 후 24시간 동안 유효해요. 한정된 시간이 오히려 특별한 만남을 만들어줘요.",
  },
  {
    q: "카카오 계정이 꼭 필요한가요?",
    a: "대화를 시작하려면 카카오 로그인이 필요해요. 하지만 프로필 구경은 로그인 없이도 가능해요!",
  },
];

// ─── Animation Variants ──────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1 },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

// ─── Counter Hook ────────────────────────────────────────

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return { count, ref };
}

// ─── Stat Card ───────────────────────────────────────────

function StatCard({
  label,
  value,
  suffix,
  delay,
}: {
  label: string;
  value: number;
  suffix: string;
  delay: number;
}) {
  const { count, ref } = useCountUp(value);
  return (
    <motion.div
      ref={ref}
      className="text-center"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay }}
    >
      <p className="text-3xl font-bold text-primary">
        {count.toLocaleString()}
        <span className="text-lg">{suffix}</span>
      </p>
      <p className="mt-1 text-sm text-gray-600">{label}</p>
    </motion.div>
  );
}

// ─── FAQ Item ────────────────────────────────────────────

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className="border-b border-gray-200 last:border-0"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="pr-4 font-semibold text-foreground">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? "max-h-40 pb-4" : "max-h-0"}`}
      >
        <p className="text-sm leading-relaxed text-gray-600">{a}</p>
      </div>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────

export default function HomePage() {
  const { isLoading, isAuthenticated } = useAuth();

  return (
    <>
      <Header transparent />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] overflow-hidden bg-gradient-to-b from-[#FFCECE] via-primary-light to-white px-5 pb-24 pt-28">
          {/* Floating hearts — pure CSS for Safari scroll compat */}
          {[
            { size: 20, left: "8%", delay: 0, duration: 7, drift: 20, rotate: 15 },
            { size: 14, left: "20%", delay: 2, duration: 9, drift: -20, rotate: -15 },
            { size: 18, left: "35%", delay: 4, duration: 8, drift: 20, rotate: 15 },
            { size: 12, left: "50%", delay: 1, duration: 10, drift: -20, rotate: -15 },
            { size: 22, left: "65%", delay: 3, duration: 7.5, drift: 20, rotate: 15 },
            { size: 16, left: "78%", delay: 5, duration: 8.5, drift: -20, rotate: -15 },
            { size: 13, left: "90%", delay: 0.5, duration: 9.5, drift: 20, rotate: 15 },
            { size: 17, left: "45%", delay: 6, duration: 8, drift: -20, rotate: -15 },
          ].map((h, i) => (
            <div
              key={i}
              className="absolute animate-float-heart text-primary will-change-transform"
              style={{
                left: h.left,
                bottom: -30,
                fontSize: h.size,
                "--duration": `${h.duration}s`,
                "--delay": `${h.delay}s`,
                "--drift": `${h.drift}px`,
                "--rotate": `${h.rotate}deg`,
              } as React.CSSProperties}
            >
              ♥
            </div>
          ))}

          <div className="relative z-10 mx-auto max-w-lg text-center">
            {/* Social Proof Badges */}
            <motion.div
              className="mb-8 flex flex-wrap justify-center gap-3"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.15 } },
              }}
            >
              <motion.div
                className="flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-2 text-sm shadow-card-border backdrop-blur-sm"
                variants={scaleIn}
                transition={{ type: "spring", duration: 0.6 }}
              >
                <span className="text-lg">🔥</span>
                <span>
                  오늘{" "}
                  <span className="font-bold text-primary">127</span>명 매칭
                </span>
              </motion.div>
              <motion.div
                className="flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-2 text-sm shadow-card-border backdrop-blur-sm"
                variants={scaleIn}
                transition={{ type: "spring", duration: 0.6 }}
              >
                <span className="text-lg">💬</span>
                <span>
                  <span className="font-bold text-primary">1,234</span>개 대화
                  진행중
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.7, delay: 0.3 }}
            >
              <Logo size="xl" asLink={false} className="mb-8" />
            </motion.div>

            <motion.p
              className="mb-3 text-base font-semibold text-primary"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              친구가 소개해주니까 믿을 수 있어요
            </motion.p>

            <motion.h1
              className="mb-4 text-4xl font-bold tracking-tight text-foreground"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              친구를 소개하는
              <br />
              가장 쉬운 방법
            </motion.h1>

            <motion.p
              className="mb-10 text-gray-600"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              인스타 스토리 하나로 시작하는 블라인드 소개팅
            </motion.p>

            {/* CTA Button — auth-aware, hidden until auth resolves */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.85 }}
            >
              <div className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}>
              {isAuthenticated ? (
                <Button size="lg" fullWidth asChild>
                  <Link href="/create">
                    시작하기
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" fullWidth variant="kakao" asChild>
                  <Link href="/login">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="currentColor"
                    >
                      <path d="M12 3c-5.148 0-9.324 3.39-9.324 7.571 0 2.722 1.804 5.107 4.516 6.449-.199.742-.722 2.687-.826 3.104-.13.525.192.518.404.377.166-.11 2.644-1.8 3.713-2.53.498.073 1.008.112 1.527.112 5.148 0 9.324-3.39 9.324-7.571S17.148 3 12 3z" />
                    </svg>
                    카카오톡으로 시작하기
                  </Link>
                </Button>
              )}
              </div>
            </motion.div>
          </div>

          {/* Soft accent blush */}
          <div className="absolute -right-20 top-0 h-80 w-80 rounded-full bg-primary/[0.18] blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-primary/[0.18] blur-3xl" />

          {/* Bottom fade for smooth transition */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* How it works */}
        <section className="px-5 py-20">
          <div className="mx-auto max-w-lg">
            <motion.h2
              className="mb-10 text-center text-2xl font-bold"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              이렇게 진행돼요
            </motion.h2>

            <div className="space-y-0">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="relative flex items-start gap-4 pb-8"
                  variants={slideInLeft}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-14 h-[calc(100%-3rem)] w-px bg-gray-200" />
                  )}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-foreground">{step.title}</h3>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Profile Preview */}
        <section className="overflow-hidden bg-gray-50 py-20">
          <div className="mx-auto max-w-lg px-5">
            <motion.h2
              className="mb-3 text-center text-2xl font-bold"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              이런 프로필이 만들어져요
            </motion.h2>
            <motion.p
              className="mb-10 text-center text-sm text-gray-600"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              친구가 작성한 블라인드 프로필 예시
            </motion.p>
          </div>

          {/* Marquee carousel */}
          <div className="relative">
            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-gray-50 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-gray-50 to-transparent" />

            <motion.div
              className="flex gap-5"
              animate={{ x: [0, -(280 * mockProfiles.length + 20 * mockProfiles.length)] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ width: "fit-content" }}
            >
              {[...mockProfiles, ...mockProfiles, ...mockProfiles, ...mockProfiles].map((profile, i) => (
                <div key={i} className="w-[280px] shrink-0">
                  <div className="overflow-hidden rounded-2xl bg-white shadow-medium">
                    <div
                      className={`relative h-36 bg-gradient-to-br ${profile.gradient}`}
                    >
                      <div className="absolute inset-0 backdrop-blur-xl" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                        <span className="rounded-full bg-black/30 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                          {profile.age}세 · {profile.gender}
                        </span>
                        <span className="rounded-full bg-black/30 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                          {profile.occupation}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="mb-3 text-sm text-foreground">
                        {profile.bio}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary"
                          >
                            #{tag}
                          </span>
                        ))}
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {profile.mbti}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.p
            className="mt-8 text-center text-xs text-gray-400"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            💕 사진은 블라인드 처리되어 대화 후 공개돼요
          </motion.p>
        </section>

        {/* Features */}
        <section className="px-5 py-20">
          <div className="mx-auto max-w-lg">
            <motion.h2
              className="mb-10 text-center text-2xl font-bold"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              친친이 특별한 이유
            </motion.h2>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="rounded-2xl bg-white p-5 shadow-card-border transition-colors duration-200 hover:shadow-card-border-hover"
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    type: "spring",
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  whileHover={{ scale: 1.03 }}
                >
                  <h3 className="font-bold text-primary">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-gray-50 px-5 py-20">
          <div className="mx-auto max-w-lg">
            <motion.h2
              className="mb-3 text-center text-2xl font-bold"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              매칭 성공 후기
            </motion.h2>
            <motion.p
              className="mb-10 text-center text-sm text-gray-600"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              친친으로 연결된 사람들의 이야기
            </motion.p>

            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl bg-white p-5 shadow-card-border"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-lg">
                      {t.emoji}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      {t.author}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-5 py-20">
          <div className="mx-auto max-w-lg">
            <motion.h2
              className="mb-10 text-center text-2xl font-bold"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              숫자로 보는 친친
            </motion.h2>

            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, i) => (
                <StatCard key={i} {...stat} delay={i * 0.1} />
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="bg-gray-50 px-5 py-20">
          <div className="mx-auto max-w-lg">
            <motion.h2
              className="mb-10 text-center text-2xl font-bold"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              기존 소개팅앱과 뭐가 달라요?
            </motion.h2>

            <motion.div
              className="overflow-hidden rounded-2xl bg-white shadow-card-border"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              {/* Table header */}
              <div className="grid grid-cols-3 border-b border-gray-100 px-4 py-3 text-center text-xs font-semibold text-gray-500">
                <span />
                <span>기존 앱</span>
                <span className="text-primary">친친</span>
              </div>

              {comparisons.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-3 items-center px-4 py-3.5 text-center text-sm ${i < comparisons.length - 1 ? "border-b border-gray-50" : ""}`}
                >
                  <span className="text-left text-xs font-medium text-gray-500">
                    {row.label}
                  </span>
                  <span className="flex items-center justify-center gap-1 text-xs text-gray-400">
                    <X className="h-3.5 w-3.5 text-gray-300" />
                    {row.traditional}
                  </span>
                  <span className="flex items-center justify-center gap-1 text-xs font-medium text-primary">
                    <Check className="h-3.5 w-3.5" />
                    {row.chinchin}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 py-24">
          <motion.div
            className="mx-auto max-w-lg"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", duration: 0.7 }}
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-8 text-center shadow-strong">
              {/* Decorative circles */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute right-12 bottom-6 h-16 w-16 rounded-full bg-white/5" />

              <div className="relative z-10">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>
                <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">
                  지금 친구를 소개해보세요
                </h2>
                <p className="mb-8 text-sm text-white/70">
                  5분이면 프로필 링크를 만들 수 있어요
                </p>

                <Button
                  size="lg"
                  fullWidth
                  className="bg-white text-primary shadow-medium hover:bg-white/90"
                  asChild
                >
                  <Link href="/create">
                    시작하기
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* FAQ */}
        <section className="px-5 pb-32 pt-20">
          <div className="mx-auto max-w-lg">
            <motion.h2
              className="mb-10 text-center text-2xl font-bold"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              자주 묻는 질문
            </motion.h2>

            <div className="rounded-2xl bg-white px-5 shadow-card-border">
              {faqs.map((faq, i) => (
                <FaqItem key={i} {...faq} index={i} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
}
