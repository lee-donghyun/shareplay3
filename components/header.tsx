"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface HeaderProps {
  left?: "none" | "muted";
  right?: "none" | "profile";
}

export function Header({ left = "muted", right = "none" }: HeaderProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (right !== "profile") {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true);
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
      setLoading(false);
    });
  }, [right]);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 backdrop-blur-md bg-background/80">
      <Link href="/">
        <span
          className={`font-[family-name:var(--font-geist-sans)] font-semibold text-lg ${
            left === "none" ? "text-white" : "text-muted-foreground"
          }`}
        >
          Shareplay
        </span>
      </Link>

      {right === "profile" && !loading && (
        <div>
          {isLoggedIn ? (
            <Link href="/my" className="flex items-center gap-2">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.handle}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {profile?.handle?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
              <span className="text-sm text-foreground">
                {profile?.handle}
              </span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm text-primary hover:underline"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
