import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MyPageClient } from "./client";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth/onboarding");
  }

  const { data: tracks } = await supabase
    .from("playlist_tracks")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  return <MyPageClient profile={profile} initialTracks={tracks ?? []} />;
}
