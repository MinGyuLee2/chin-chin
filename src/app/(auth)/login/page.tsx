"use client";

import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleKakaoLogin = () => {
    const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

    // Store redirect URL in sessionStorage
    sessionStorage.setItem("auth_redirect", redirect);

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(redirectUri!)}&response_type=code&scope=profile_nickname,profile_image`;

    window.location.href = kakaoAuthUrl;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <Logo size="lg" asLink={false} className="mb-4" />
          <h1 className="text-2xl font-bold">시작하기</h1>
          <p className="mt-2 text-muted-foreground">
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
