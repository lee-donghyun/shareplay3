import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MyPageClient } from "./client";

export const metadata: Metadata = {
  title: "My Profile",
  openGraph: {
    title: "My Profile - Shareplay",
  },
};

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // async-parallel: profile and tracks are independent queries — fetch in parallel
  // server-serialization: select only fields the client component uses
  const [{ data: profile }, { data: tracks }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, handle, message, avatar_url")
      .eq("id", user.id)
      .single(),
    supabase
      .from("playlist_tracks")
      .select(
        "id, user_id, track_id, track_name, artist_name, collection_name, artwork_url, preview_url, track_view_url, position",
      )
      .eq("user_id", user.id)
      .order("position", { ascending: true }),
  ]);

  if (!profile) {
    redirect("/auth/onboarding");
  }

  return <MyPageClient profile={profile} initialTracks={tracks ?? []} />;
}
