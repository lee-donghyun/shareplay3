import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="min-h-dvh flex flex-col pt-13">
      <Header left="none" right="none" />

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm md:max-w-md space-y-8 text-center">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              Shareplay
            </h1>
            <p className="text-lg text-muted-foreground">
              Create your own playlist
              <br />
              and share it with friends.
            </p>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3 justify-center">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground text-sm font-medium">
                1
              </span>
              <span>Search and add your favorite songs</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground text-sm font-medium">
                2
              </span>
              <span>Browse your playlist in coverflow</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground text-sm font-medium">
                3
              </span>
              <span>Share with anyone via a single link</span>
            </div>
          </div>

          <Link href="/auth/login">
            <Button size="lg" className="w-full rounded-lg">
              Get Started
            </Button>
          </Link>

          <p className="text-xs text-muted-foreground mt-8">
            <Link
              href="/privacy"
              className="underline hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            {" · "}
            <Link
              href="/terms"
              className="underline hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
