import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Check if user has profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id,handle")
      .eq("id", user.id)
      .single();

    if (profile) {
      redirect(`/u/${profile.handle}`);
    } else {
      redirect("/auth/onboarding");
    }
  }

  redirect("/auth/login");
}
