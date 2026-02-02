import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BlindProfileView } from "@/components/profile/blind-profile-view";
import { ExpiredProfileView } from "@/components/profile/expired-profile-view";
import { isExpired, getProfileUrl } from "@/lib/utils";

interface Props {
  params: Promise<{ shortId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shortId } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("bio, age, gender, interest_tags, photo_url")
    .eq("short_id", shortId)
    .single();

  if (!profile) {
    return {
      title: "프로필을 찾을 수 없어요",
    };
  }

  const genderText = profile.gender === "male" ? "남" : "여";
  const title = `${profile.age}세 ${genderText} | 친친`;
  const description = profile.bio;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [profile.photo_url],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [profile.photo_url],
    },
  };
}

export default async function BlindProfilePage({ params }: Props) {
  const { shortId } = await params;
  const supabase = await createClient();

  // Fetch profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("short_id", shortId)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Check if expired
  if (isExpired(profile.expires_at) || !profile.is_active) {
    return <ExpiredProfileView />;
  }

  // Increment view count (non-blocking)
  supabase.rpc("increment_view_count", { profile_short_id: shortId });

  return <BlindProfileView profile={profile} />;
}
