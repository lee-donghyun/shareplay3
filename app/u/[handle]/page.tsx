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

  // server-serialization: select only fields the client component uses
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, message, avatar_url")
    .eq("handle", handle)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: tracks } = await supabase
    .from("playlist_tracks")
    .select(
      "id, track_id, track_name, artist_name, collection_name, artwork_url, preview_url, track_view_url, position",
    )
    .eq("user_id", profile.id)
    .order("position", { ascending: true });

  return <ProfilePageClient profile={profile} tracks={tracks ?? []} />;
}
