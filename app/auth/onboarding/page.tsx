"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function OnboardingPage() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Not authenticated");
        return;
      }

      // Check handle uniqueness
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("handle", handle)
        .single();

      if (existing) {
        setError("This handle is already taken");
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        handle,
        message,
        avatar_url: user.user_metadata?.avatar_url || null,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      router.push("/my");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome to Shareplay
          </h1>
          <p className="text-sm text-muted-foreground">
            Set up your profile to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Handle <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="your-unique-handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Message
            </label>
            <Textarea
              placeholder="Write a short message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Setting up..." : "Get Started"}
          </Button>
        </form>
      </div>
    </div>
  );
}
