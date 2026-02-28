import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProfilePageClient } from "./client";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: tracks } = await supabase
    .from("playlist_tracks")
    .select("*")
    .eq("user_id", profile.id)
    .order("position", { ascending: true });

  return <ProfilePageClient profile={profile} tracks={tracks ?? []} />;
}
