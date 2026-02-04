"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Eye,
  MessageCircle,
  Clock,
  Copy,
  Trash2,
  LogOut,
  Heart,
  Ban,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/common/tag";
import { CountdownTimer } from "@/components/common/countdown-timer";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { BlockedUsers } from "@/components/dashboard/blocked-users";
import { useToast } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { getProfileUrl, isExpired } from "@/lib/utils";
import { deleteProfile } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Profile } from "@/types/database";

type FilterType = "all" | "active" | "expired" | "success";

export default function DashboardPage() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function fetchProfiles() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("creator_id", user!.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProfiles(data);
      }
      setIsLoading(false);
    }

    fetchProfiles();
  }, [user]);

  const handleCopyLink = async (shortId: string) => {
    const url = getProfileUrl(shortId);
    await navigator.clipboard.writeText(url);
    toast({
      title: "복사 완료",
      description: "링크가 클립보드에 복사되었어요",
      variant: "success",
    });
  };

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteProfile(deleteTarget);
      if (result.error) {
        toast({
          title: "삭제 실패",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      setProfiles((prev) => prev.filter((p) => p.id !== deleteTarget));
      toast({
        title: "삭제 완료",
        description: "프로필이 삭제되었어요",
        variant: "success",
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, toast]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const filteredProfiles = profiles.filter((profile) => {
    const expired = isExpired(profile.expires_at) || !profile.is_active;

    switch (filter) {
      case "active":
        return !expired;
      case "expired":
        return expired;
      case "success":
        return profile.chat_request_count > 0;
      default:
        return true;
    }
  });

  const stats = {
    total: profiles.length,
    active: profiles.filter((p) => !isExpired(p.expires_at) && p.is_active)
      .length,
    totalViews: profiles.reduce((sum, p) => sum + p.view_count, 0),
    totalRequests: profiles.reduce((sum, p) => sum + p.chat_request_count, 0),
  };

  const conversionRate =
    stats.totalViews > 0
      ? ((stats.totalRequests / stats.totalViews) * 100).toFixed(1)
      : "0";

  if (authLoading) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-muted pb-24">
        {/* User info header */}
        <div className="bg-white px-4 py-6">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={user?.profile_image_url}
                alt={user?.nickname || ""}
                size="lg"
              />
              <div>
                <h1 className="text-xl font-bold">{user?.nickname}</h1>
                <p className="text-sm text-muted-foreground">
                  {stats.total}개의 소개 · {stats.totalViews}회 조회
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="px-4 py-4">
          <div className="mx-auto grid max-w-lg grid-cols-4 gap-2">
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.active}
                </div>
                <div className="text-xs text-muted-foreground">활성 링크</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-secondary">
                  {stats.totalViews}
                </div>
                <div className="text-xs text-muted-foreground">총 조회수</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.totalRequests}
                </div>
                <div className="text-xs text-muted-foreground">대화 신청</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-0.5">
                  <Heart className="h-3.5 w-3.5 text-primary fill-primary" />
                  <span className="text-xl font-bold text-primary">
                    {conversionRate}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">매칭률</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-4 pb-4">
          <div className="mx-auto flex max-w-lg gap-2 overflow-x-auto no-scrollbar">
            {[
              { key: "all", label: "전체" },
              { key: "active", label: "활성" },
              { key: "expired", label: "만료" },
              { key: "success", label: "신청있음" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as FilterType)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? "bg-primary text-white"
                    : "bg-white text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Profile list */}
        <div className="px-4">
          <div className="mx-auto max-w-lg space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="flex gap-4 p-4">
                      <div className="h-20 w-20 rounded-xl bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-muted" />
                        <div className="h-3 w-1/2 rounded bg-muted" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mb-4 text-4xl">📭</div>
                <p className="mb-4 text-muted-foreground">
                  {filter === "all"
                    ? "아직 만든 소개가 없어요"
                    : "조건에 맞는 소개가 없어요"}
                </p>
                <Button asChild>
                  <Link href="/create">
                    <Plus className="mr-2 h-5 w-5" />
                    친구 소개하기
                  </Link>
                </Button>
              </div>
            ) : (
              filteredProfiles.map((profile, index) => {
                const expired =
                  isExpired(profile.expires_at) || !profile.is_active;

                return (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={expired ? "opacity-60" : ""}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Thumbnail */}
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                            <img
                              src={profile.photo_url}
                              alt=""
                              className="h-full w-full object-cover blur-lg"
                            />
                            {expired && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <Clock className="h-6 w-6 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="mb-1 truncate font-medium">
                              {profile.bio}
                            </p>
                            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                {profile.age}세 ·{" "}
                                {profile.gender === "male" ? "남" : "여"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Eye className="h-4 w-4" />
                                {profile.view_count}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <MessageCircle className="h-4 w-4" />
                                {profile.chat_request_count}
                              </span>
                              {!expired && (
                                <CountdownTimer
                                  expiresAt={profile.expires_at}
                                  size="sm"
                                  showIcon={false}
                                />
                              )}
                              {expired && (
                                <Tag variant="muted" size="sm">
                                  만료됨
                                </Tag>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1">
                            {!expired && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleCopyLink(profile.short_id)
                                }
                              >
                                <Copy className="h-5 w-5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(profile.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Blocked users section */}
        <div className="px-4 pt-6">
          <div className="mx-auto max-w-lg">
            <button
              onClick={() => setShowBlockedUsers(!showBlockedUsers)}
              className="flex w-full items-center justify-between rounded-lg bg-white px-4 py-3 text-sm font-medium"
            >
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 text-muted-foreground" />
                차단 관리
              </div>
              {showBlockedUsers ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {showBlockedUsers && (
              <div className="mt-2">
                <BlockedUsers />
              </div>
            )}
          </div>
        </div>

        {/* FAB */}
        <Link
          href="/create"
          className="fixed bottom-24 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-strong transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="h-7 w-7" />
        </Link>
      </main>

      <BottomNav />

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="mx-4 max-w-sm">
          <DialogHeader>
            <DialogTitle>프로필을 삭제하시겠어요?</DialogTitle>
            <DialogDescription>
              삭제된 프로필은 더 이상 공유할 수 없어요. 기존 대화에는 영향이
              없어요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              loading={isDeleting}
            >
              삭제하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
