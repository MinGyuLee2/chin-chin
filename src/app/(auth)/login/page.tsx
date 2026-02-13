"use client";

import { Suspense } from "react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const handleKakaoLogin = () => {
    const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

    // CSRF 보호: 랜덤 state 생성 후 쿠키에 저장
    const state = crypto.randomUUID();
    document.cookie = `kakao_oauth_state=${state}; path=/; max-age=600; SameSite=Lax`;

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(redirectUri!)}&response_type=code&scope=profile_nickname,profile_image&state=${state}`;

    window.location.href = kakaoAuthUrl;
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-primary-light/30 to-white px-5">
      {/* Decorative blobs */}
      <div className="absolute -right-32 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -left-32 bottom-1/4 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />

      <div className="relative w-full max-w-sm space-y-10 text-center">
        <div>
          <Logo size="lg" asLink={false} className="mb-6" />
          <h1 className="text-2xl font-bold tracking-tight">시작하기</h1>
          <p className="mt-3 text-gray-600">
            카카오 계정으로 간편하게 로그인하세요
          </p>
        </div>

        <Button
          variant="kakao"
          size="lg"
          fullWidth
          onClick={handleKakaoLogin}
          className="flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
            <path d="M12 3c-5.148 0-9.324 3.39-9.324 7.571 0 2.722 1.804 5.107 4.516 6.449-.199.742-.722 2.687-.826 3.104-.13.525.192.518.404.377.166-.11 2.644-1.8 3.713-2.53.498.073 1.008.112 1.527.112 5.148 0 9.324-3.39 9.324-7.571S17.148 3 12 3z" />
          </svg>
          카카오톡으로 시작하기
        </Button>

        <p className="text-xs text-muted-foreground">
          로그인 시{" "}
          <a href="/terms" className="underline">
            서비스 이용약관
          </a>
          과{" "}
          <a href="/privacy" className="underline">
            개인정보 처리방침
          </a>
          에 동의하게 됩니다.
        </p>
      </div>
    </main>
  );
}
