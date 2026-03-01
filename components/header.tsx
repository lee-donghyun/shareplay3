"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  left?: "none" | "muted";
  right?: "none" | "profile";
}

export function Header({ left = "muted", right = "none" }: HeaderProps) {
  const router = useRouter();
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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

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
          {isLoggedIn && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 outline-none cursor-pointer">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.handle}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {profile.handle?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{profile.handle}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push(`/u/${profile.handle}`)}
                  >
                    My Shareplay
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/my")}>
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-muted-foreground"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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
