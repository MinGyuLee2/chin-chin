"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  requiresAuth?: boolean;
}

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide on login page and individual chat pages
  if (pathname === "/login" || pathname.startsWith("/chat/")) {
    return null;
  }

  // Hide on profile view pages (m/[shortId])
  if (pathname.startsWith("/m/")) {
    return null;
  }

  // Hide on notifications page
  if (pathname.startsWith("/notifications")) {
    return null;
  }

  // Hide on invite profile pages
  if (pathname.startsWith("/invite/")) {
    return null;
  }

  const navItems: NavItem[] = [
    { href: "/", icon: Home, label: "홈" },
    { href: "/create", icon: PlusCircle, label: "소개하기", requiresAuth: true },
    { href: "/chat", icon: MessageCircle, label: "채팅", requiresAuth: true },
    { href: "/dashboard", icon: User, label: "내 정보", requiresAuth: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 shadow-[0_-1px_0_0_rgba(0,0,0,0.06)] bg-white/90 backdrop-blur-[16px] safe-bottom">
      <div className="mx-auto flex h-[68px] max-w-lg items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          // 현재 활성화된 페이지면 항상 원래 href 유지 (리다이렉트 방지)
          // 비활성화된 페이지일 때만 auth 체크
          const href = isActive
            ? item.href  // 현재 페이지는 항상 원래 경로
            : (item.requiresAuth && !user)
              ? `/login?redirect=${item.href}`
              : item.href;

          return (
            <Link
              key={item.href}
              href={href}
              onClick={(e) => {
                // 현재 활성화된 페이지면 네비게이션 방지
                if (isActive) {
                  e.preventDefault();
                }
              }}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-2 transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 transition-transform duration-200",
                  isActive && "fill-primary/20 scale-105"
                )}
              />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
