"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <Logo size="lg" asLink={false} className="mb-6" />

        <h1 className="mb-2 text-4xl font-bold text-primary">오류 발생</h1>
        <p className="mb-8 text-muted-foreground">
          예상치 못한 오류가 발생했어요. 다시 시도해주세요.
        </p>

        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>다시 시도</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </main>
  );
}
