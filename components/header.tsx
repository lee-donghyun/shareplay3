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

// Module-level cache – persists across client-side navigations
let profileCache: {
  profile: Profile | null;
  isLoggedIn: boolean;
  loaded: boolean;
} | null = null;

// Subscribers notified when profileCache is updated
const cacheSubscribers = new Set<() => void>();

/** Clear the cached profile (call after logout). */
export function invalidateProfileCache() {
  profileCache = null;
}

/** Update the cached profile and notify the Header (call after profile edit). */
export function updateProfileCache(profile: Profile) {
  profileCache = { profile, isLoggedIn: true, loaded: true };
  cacheSubscribers.forEach((fn) => fn());
}

interface HeaderProps {
  left?: "none" | "muted";
  right?: "none" | "profile";
}

export function Header({ left = "muted", right = "none" }: HeaderProps) {
  const router = useRouter();

  // Initialise from cache when available so the first render is instant
  const [profile, setProfile] = useState<Profile | null>(
    profileCache?.profile ?? null,
  );
  const [isLoggedIn, setIsLoggedIn] = useState(
    profileCache?.isLoggedIn ?? false,
  );
  const [loading, setLoading] = useState(
    right === "profile" ? !profileCache?.loaded : false,
  );
  const [animate, setAnimate] = useState(false);

  // Subscribe to cache updates so the Header re-renders after profile edits
  useEffect(() => {
    const handler = () => {
      setProfile(profileCache?.profile ?? null);
      setIsLoggedIn(profileCache?.isLoggedIn ?? false);
      setLoading(false);
    };
    cacheSubscribers.add(handler);
    return () => {
      cacheSubscribers.delete(handler);
    };
  }, []);

  useEffect(() => {
    if (right !== "profile") return;

    // If we already have a cached result, skip the fetch
    if (profileCache?.loaded) return;

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      let fetchedProfile: Profile | null = null;
      const loggedIn = !!user;

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) fetchedProfile = data;
      }

      // Persist to module-level cache
      profileCache = {
        profile: fetchedProfile,
        isLoggedIn: loggedIn,
        loaded: true,
      };

      setProfile(fetchedProfile);
      setIsLoggedIn(loggedIn);
      setLoading(false);
      setAnimate(true);
    });
  }, [right]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    invalidateProfileCache();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/">
          <span
            className={`font-[family-name:var(--font-geist-sans)] font-semibold text-lg ${
              left === "none" ? "text-white" : "text-muted-foreground"
            }`}
          >
            Shareplay
          </span>
        </Link>

        {/* Reserve a fixed 8×8 (32px) box so the header never shifts */}
        {right === "profile" && (
          <div className="h-8 flex items-center justify-center">
            {!loading &&
              (isLoggedIn && profile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={`flex items-center gap-2 outline-none cursor-pointer ${
                      animate
                        ? "animate-in fade-in zoom-in-75 duration-300"
                        : ""
                    }`}
                  >
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
                  className={`text-sm text-primary hover:underline ${
                    animate ? "animate-in fade-in duration-300" : ""
                  }`}
                >
                  Sign In
                </Link>
              ))}
          </div>
        )}
      </div>
    </header>
  );
}
