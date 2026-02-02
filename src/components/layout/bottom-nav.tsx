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

const navItems: NavItem[] = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/create", icon: PlusCircle, label: "소개하기", requiresAuth: true },
  { href: "/chat", icon: MessageCircle, label: "채팅", requiresAuth: true },
  { href: "/dashboard", icon: User, label: "내 정보", requiresAuth: true },
];

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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-soft safe-bottom">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          // If requires auth and not logged in, redirect to login
          const href =
            item.requiresAuth && !user
              ? `/login?redirect=${item.href}`
              : item.href;

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon
                className={cn("h-6 w-6", isActive && "fill-primary/20")}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
