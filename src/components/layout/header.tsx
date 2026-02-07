"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
  transparent?: boolean;
}

export function Header({ className, transparent }: HeaderProps) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const supabaseRef = useRef(createClient());

  // Fetch unread notification count + realtime subscription
  useEffect(() => {
    if (!user) return;

    const supabase = supabaseRef.current;

    async function fetchUnread() {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("is_read", false);

      setUnreadCount(count || 0);
    }

    fetchUnread();

    const channel = supabase
      .channel("header_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Hide header on chat pages
  if (pathname.startsWith("/chat/")) {
    return null;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full",
        transparent ? "bg-transparent" : "bg-white/80 backdrop-blur-soft",
        !transparent && "shadow-[0_1px_0_0_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Logo size="sm" />

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <>
              <Link href="/dashboard">
                <Avatar
                  src={user.profile_image_url}
                  alt={user.nickname || "프로필"}
                  size="sm"
                />
              </Link>
              <Link
                href="/notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-100"
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </>
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
