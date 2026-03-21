"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface UseAuthResult {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  refreshUser: () => Promise<User | null>;
  requireLogin: (redirectPath?: string) => Promise<User | null>;
}

export function useAuth(): UseAuthResult {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    setUser(currentUser ?? null);
    return currentUser ?? null;
  }, [supabase]);

  useEffect(() => {
    void refreshUser().finally(() => {
      setLoading(false);
    });
  }, [refreshUser]);

  const requireLogin = useCallback(
    async (redirectPath = "/auth/login") => {
      const currentUser = user ?? (await refreshUser());
      if (!currentUser) {
        window.location.href = redirectPath;
        return null;
      }

      return currentUser;
    },
    [refreshUser, user],
  );

  return {
    user,
    isLoggedIn: !!user,
    loading,
    refreshUser,
    requireLogin,
  };
}
