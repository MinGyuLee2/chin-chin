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
  Ban,
  ChevronDown,
  ChevronUp,
  Share2,
  Instagram,
  Send,
  Check,
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
import { deleteProfile, deleteInvitation, activateAndShare } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Profile, Invitation } from "@/types/database";

type TabType = "invitations" | "profiles";

type InvitationWithProfile = Invitation & {
  profile?: Profile | null;
};

export default function DashboardPage() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabType>("invitations");
  const [invitations, setInvitations] = useState<InvitationWithProfile[]>([]);
  const [selfProfiles, setSelfProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "profile" | "invitation"; id: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sharingInvitation, setSharingInvitation] = useState<{ id: string; shortId: string } | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      const supabase = createClient();

      // Fetch invitations (matchmaker's)
      const { data: invData } = await supabase
        .from("invitations")
        .select("*")
        .eq("matchmaker_id", user!.id)
        .order("created_at", { ascending: false });

      // If invitations have profile_ids, fetch those profiles
      const invitations = (invData || []) as InvitationWithProfile[];
      const profileIds = invitations
        .map((inv) => inv.profile_id)
        .filter(Boolean) as string[];

      if (profileIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("*")
          .in("id", profileIds);

        const profilesMap = new Map(
          ((profilesData || []) as Profile[]).map((p) => [p.id, p])
        );

        invitations.forEach((inv) => {
          if (inv.profile_id) {
            inv.profile = profilesMap.get(inv.profile_id) || null;
          }
        });
      }

      setInvitations(invitations);

      // Fetch self profiles (creator_id = user, matchmaker_id = null)
      const { data: selfData } = await supabase
        .from("profiles")
        .select("*")
        .eq("creator_id", user!.id)
        .is("matchmaker_id", null)
        .order("created_at", { ascending: false });

      setSelfProfiles((selfData || []) as Profile[]);
      setIsLoading(false);
    }

    fetchData();
  }, [user]);

  const handleCopyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast({
      title: "복사 완료",
      description: "링크가 클립보드에 복사되었어요",
      variant: "success",
    });
  };

  const handleActivateAndShare = async (invitationId: string) => {
    setActivatingId(invitationId);
    try {
      const result = await activateAndShare(invitationId);
      if (result.error) {
        toast({ title: "오류", description: result.error, variant: "destructive" });
        return;
      }

      // Update local state
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId ? { ...inv, status: "shared" as const } : inv
        )
      );

      if (result.shortId) {
        setSharingInvitation({ id: invitationId, shortId: result.shortId });
      }

      toast({ title: "성공", description: "프로필이 활성화되었어요!", variant: "success" });
    } finally {
      setActivatingId(null);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result =
        deleteTarget.type === "profile"
          ? await deleteProfile(deleteTarget.id)
          : await deleteInvitation(deleteTarget.id);

      if (result.error) {
        toast({ title: "삭제 실패", description: result.error, variant: "destructive" });
        return;
      }

      if (deleteTarget.type === "profile") {
        setSelfProfiles((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      } else {
        setInvitations((prev) => prev.filter((inv) => inv.id !== deleteTarget.id));
      }

      toast({ title: "삭제 완료", description: "삭제되었어요", variant: "success" });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, toast]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const handleInstagramShare = async (shortId: string) => {
    const url = getProfileUrl(shortId);
    try {
      await navigator.clipboard.writeText(url);
    } catch { /* */ }
    toast({
      title: "링크가 복사되었어요!",
      description: "스토리에서 링크 스티커를 추가하고 붙여넣기 하세요 📎",
      variant: "success",
    });
    setTimeout(() => {
      window.open("instagram://story-camera", "_blank");
    }, 500);
  };

  // Stats
  const activeInvitations = invitations.filter((inv) => inv.status === "shared" && inv.profile).length;
  const activeSelfProfiles = selfProfiles.filter((p) => !isExpired(p.expires_at) && p.is_active).length;

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

      <main className="min-h-screen bg-gray-50 pb-24">
        {/* User info header */}
        <div className="bg-white px-5 py-6 shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={user?.profile_image_url}
                alt={user?.nickname || ""}
                size="lg"
              />
              <div>
                <h1 className="text-xl font-bold">{user?.nickname}</h1>
                <p className="text-sm text-gray-600">
                  초대 {invitations.length}개 · 셀프 {selfProfiles.length}개
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="bg-white px-5 pb-0 pt-2 shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
          <div className="mx-auto flex max-w-lg">
            <button
              onClick={() => setTab("invitations")}
              className={`flex-1 border-b-2 pb-3 pt-2 text-sm font-medium transition-colors ${
                tab === "invitations"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              내가 초대한 ({invitations.length})
            </button>
            <button
              onClick={() => setTab("profiles")}
              className={`flex-1 border-b-2 pb-3 pt-2 text-sm font-medium transition-colors ${
                tab === "profiles"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              내 프로필 ({selfProfiles.length})
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="px-5 pt-4">
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
            ) : tab === "invitations" ? (
              /* Invitations tab */
              invitations.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mb-6 text-6xl">💌</div>
                  <h3 className="mb-2 text-lg font-bold">아직 초대가 없어요</h3>
                  <p className="mb-6 text-muted-foreground">
                    친구를 초대해서 소개해보세요!
                  </p>
                  <Button size="lg" asChild>
                    <Link href="/create/invite">
                      <Send className="mr-2 h-5 w-5" />
                      친구 초대하기
                    </Link>
                  </Button>
                </div>
              ) : (
                invitations.map((inv, index) => (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Status badge */}
                            <div className="mb-2">
                              {inv.status === "pending" && (
                                <Tag variant="warning" size="sm">대기중</Tag>
                              )}
                              {inv.status === "completed" && (
                                <Tag variant="success" size="sm">작성완료</Tag>
                              )}
                              {inv.status === "shared" && (
                                <Tag variant="primary" size="sm">공유됨</Tag>
                              )}
                              {inv.status === "expired" && (
                                <Tag variant="muted" size="sm">만료됨</Tag>
                              )}
                            </div>

                            {/* Profile info (if completed) */}
                            {inv.profile ? (
                              <div className="mb-2">
                                <p className="truncate font-medium">{inv.profile.bio}</p>
                                <p className="text-sm text-muted-foreground">
                                  {inv.profile.age}세 · {inv.profile.gender === "male" ? "남" : "여"}
                                </p>
                              </div>
                            ) : (
                              <p className="mb-2 text-sm text-muted-foreground">
                                {inv.matchmaker_message || "초대 링크가 전송되었어요"}
                              </p>
                            )}

                            {/* Stats for shared */}
                            {inv.status === "shared" && inv.profile && (
                              <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Eye className="h-4 w-4" />
                                  {inv.profile.view_count}
                                </span>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <MessageCircle className="h-4 w-4" />
                                  {inv.profile.chat_request_count}
                                </span>
                                {inv.profile.is_active && !isExpired(inv.profile.expires_at) && (
                                  <CountdownTimer
                                    expiresAt={inv.profile.expires_at}
                                    size="sm"
                                    showIcon={false}
                                  />
                                )}
                              </div>
                            )}

                            {/* Expiry for pending */}
                            {inv.status === "pending" && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(inv.expires_at).toLocaleDateString("ko-KR")}까지 유효
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 flex-col gap-1">
                            {inv.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const url = `${window.location.origin}/invite/${inv.invite_code}`;
                                  handleCopyLink(url);
                                }}
                              >
                                <Copy className="h-5 w-5" />
                              </Button>
                            )}
                            {inv.status === "completed" && (
                              <Button
                                size="sm"
                                onClick={() => handleActivateAndShare(inv.id)}
                                disabled={activatingId === inv.id}
                              >
                                {activatingId === inv.id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                  <>
                                    <Share2 className="mr-1 h-4 w-4" />
                                    공유하기
                                  </>
                                )}
                              </Button>
                            )}
                            {inv.status === "shared" && inv.profile && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyLink(getProfileUrl(inv.profile!.short_id))}
                              >
                                <Copy className="h-5 w-5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget({ type: "invitation", id: inv.id })}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )
            ) : (
              /* Self profiles tab */
              selfProfiles.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mb-6 text-6xl">✨</div>
                  <h3 className="mb-2 text-lg font-bold">직접 만든 프로필이 없어요</h3>
                  <p className="mb-6 text-muted-foreground">
                    내 프로필을 직접 만들어보세요!
                  </p>
                  <Button size="lg" asChild>
                    <Link href="/create/self">
                      <Plus className="mr-2 h-5 w-5" />
                      내 프로필 만들기
                    </Link>
                  </Button>
                </div>
              ) : (
                selfProfiles.map((profile, index) => {
                  const expired = isExpired(profile.expires_at) || !profile.is_active;

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
                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
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
                              <p className="mb-1 truncate font-medium">{profile.bio}</p>
                              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                <span>
                                  {profile.age}세 · {profile.gender === "male" ? "남" : "여"}
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
                                  <Tag variant="muted" size="sm">만료됨</Tag>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-1">
                              {!expired && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopyLink(getProfileUrl(profile.short_id))}
                                >
                                  <Copy className="h-5 w-5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteTarget({ type: "profile", id: profile.id })}
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
              )
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
            <DialogTitle>
              {deleteTarget?.type === "invitation" ? "초대를 삭제하시겠어요?" : "프로필을 삭제하시겠어요?"}
            </DialogTitle>
            <DialogDescription>
              {deleteTarget?.type === "invitation"
                ? "삭제하면 초대 링크와 연결된 프로필이 함께 삭제돼요."
                : "삭제된 프로필은 더 이상 공유할 수 없어요. 기존 대화에는 영향이 없어요."}
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

      {/* Share dialog (after activation) */}
      <Dialog
        open={sharingInvitation !== null}
        onOpenChange={(open) => !open && setSharingInvitation(null)}
      >
        <DialogContent className="mx-4 max-w-sm">
          <DialogHeader>
            <DialogTitle>프로필이 활성화되었어요!</DialogTitle>
            <DialogDescription>
              24시간 동안 활성화됩니다. 지금 공유해보세요!
            </DialogDescription>
          </DialogHeader>
          {sharingInvitation && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl bg-muted p-3">
                <div className="flex-1 truncate font-mono text-xs">
                  {getProfileUrl(sharingInvitation.shortId)}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopyLink(getProfileUrl(sharingInvitation.shortId))}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                fullWidth
                size="lg"
                onClick={() => handleInstagramShare(sharingInvitation.shortId)}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90"
              >
                <Instagram className="mr-2 h-5 w-5" />
                인스타 스토리에 공유하기
              </Button>
              <Button
                fullWidth
                variant="outline"
                onClick={() => setSharingInvitation(null)}
              >
                닫기
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
