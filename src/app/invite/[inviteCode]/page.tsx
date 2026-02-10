import { createAdminClient } from "@/lib/supabase/server";
import type { Invitation, User } from "@/types/database";
import { InviteProfileForm } from "./invite-profile-form";

interface Props {
  params: Promise<{ inviteCode: string }>;
}

export default async function InviteProfilePage({ params }: Props) {
  const { inviteCode } = await params;

  const supabase = await createAdminClient();

  // Fetch invitation
  const { data: invitationData, error: inviteError } = await supabase
    .from("invitations")
    .select("*")
    .eq("invite_code", inviteCode)
    .single();

  if (inviteError || !invitationData) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">유효하지 않은 초대</h1>
          <p className="text-muted-foreground">
            초대 링크를 확인해주세요.
          </p>
        </div>
      </main>
    );
  }

  const invitation = invitationData as Invitation;

  // Check expiry
  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">만료된 초대</h1>
          <p className="text-muted-foreground">
            이 초대 링크는 만료되었어요. 주선자에게 새 링크를 요청해주세요.
          </p>
        </div>
      </main>
    );
  }

  // Check if already completed
  if (invitation.status !== "pending") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">이미 완료된 초대</h1>
          <p className="text-muted-foreground">
            이 초대는 이미 프로필이 작성되었어요.
          </p>
        </div>
      </main>
    );
  }

  // Fetch matchmaker info
  const { data: matchmakerData } = await supabase
    .from("users")
    .select("nickname, profile_image_url")
    .eq("id", invitation.matchmaker_id)
    .single();

  const matchmaker = matchmakerData as Pick<User, "nickname" | "profile_image_url"> | null;

  return (
    <InviteProfileForm
      inviteCode={inviteCode}
      matchmakerNickname={matchmaker?.nickname || "친구"}
      matchmakerMessage={invitation.matchmaker_message}
    />
  );
}
