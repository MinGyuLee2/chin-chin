import Link from "next/link";
import { ArrowRight, Heart, MessageCircle, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

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

export default function HomePage() {
  return (
    <>
      <Header transparent />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] overflow-hidden bg-gradient-to-b from-primary-light to-white px-5 pb-24 pt-28">
          <div className="mx-auto max-w-lg text-center">
            {/* Social Proof Badges */}
            <div className="mb-8 flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-2 text-sm shadow-card-border backdrop-blur-sm">
                <span className="text-lg">🔥</span>
                <span>오늘 <span className="font-bold text-primary">127</span>명 매칭</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-2 text-sm shadow-card-border backdrop-blur-sm">
                <span className="text-lg">💬</span>
                <span><span className="font-bold text-primary">1,234</span>개 대화 진행중</span>
              </div>
            </div>

            <Logo size="xl" asLink={false} className="mb-8" />

            <p className="mb-3 text-base font-semibold text-primary">
              친구가 소개해주니까 믿을 수 있어요
            </p>

            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
              친구를 소개하는
              <br />
              가장 쉬운 방법
            </h1>

            <p className="mb-10 text-gray-600">
              인스타 스토리 하나로 시작하는 블라인드 소개팅
            </p>

            {/* Dual CTA Buttons */}
            <div className="space-y-3">
              <Button size="lg" fullWidth variant="kakao" asChild>
                <Link href="/login">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                    <path d="M12 3c-5.148 0-9.324 3.39-9.324 7.571 0 2.722 1.804 5.107 4.516 6.449-.199.742-.722 2.687-.826 3.104-.13.525.192.518.404.377.166-.11 2.644-1.8 3.713-2.53.498.073 1.008.112 1.527.112 5.148 0 9.324-3.39 9.324-7.571S17.148 3 12 3z" />
                  </svg>
                  카카오톡으로 시작하기
                </Link>
              </Button>
              <Button size="lg" fullWidth variant="outline" asChild>
                <Link href="/dashboard">
                  먼저 둘러보기
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
        </section>

        {/* How it works */}
        <section className="px-5 py-20">
          <div className="mx-auto max-w-lg">
            <h2 className="mb-10 text-center text-2xl font-bold">이렇게 진행돼요</h2>

            <div className="space-y-0">
              {steps.map((step, index) => (
                <div key={index} className="relative flex items-start gap-4 pb-8">
                  {/* Connector line */}
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 px-5 py-20">
          <div className="mx-auto max-w-lg">
            <h2 className="mb-10 text-center text-2xl font-bold">친친이 특별한 이유</h2>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-white p-5 shadow-card-border transition-all duration-200 hover:shadow-card-border-hover"
                >
                  <h3 className="font-bold text-primary">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 py-24">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              지금 친구를 소개해보세요
            </h2>
            <p className="mb-10 text-gray-600">
              5분이면 프로필 링크를 만들 수 있어요
            </p>

            <Button size="lg" fullWidth asChild>
              <Link href="/create">
                친구 소개하기
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
}
