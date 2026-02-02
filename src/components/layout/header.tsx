"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
  transparent?: boolean;
}

export function Header({ className, transparent }: HeaderProps) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  // Hide header on chat pages
  if (pathname.startsWith("/chat/")) {
    return null;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full",
        transparent ? "bg-transparent" : "bg-white/80 backdrop-blur-soft",
        !transparent && "border-b border-border/50",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Logo size="sm" />

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <Link href="/dashboard">
              <Avatar
                src={user.profile_image_url}
                alt={user.nickname || "프로필"}
                size="sm"
              />
            </Link>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">로그인</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
