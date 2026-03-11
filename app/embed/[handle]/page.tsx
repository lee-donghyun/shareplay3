import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EmbedPageClient } from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  return {
    title: `${handle}'s Shareplay`,
    robots: "noindex",
  };
}

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const supabase = await createClient();

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

  return <EmbedPageClient profile={profile} tracks={tracks ?? []} />;
}
