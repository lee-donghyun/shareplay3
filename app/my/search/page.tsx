"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { TrackListItem } from "@/components/track-list-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { ITunesTrack } from "@/lib/types";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ITunesTrack[]>([]);
  const [addedTrackIds, setAddedTrackIds] = useState<Set<number>>(new Set());
  // rerender-functional-setstate: ref mirrors state so handleAdd stays stable
  const addedTrackIdsRef = useRef(addedTrackIds);
  useEffect(() => {
    addedTrackIdsRef.current = addedTrackIds;
  }, [addedTrackIds]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const undoTimeoutRefs = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Load existing track IDs
  useEffect(() => {
    const loadExisting = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("playlist_tracks")
          .select("track_id")
          .eq("user_id", user.id);
        if (data) {
          setAddedTrackIds(new Set(data.map((t) => t.track_id)));
        }
      }
    };
    loadExisting();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(
            query,
          )}&entity=song&limit=20`,
        );
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleAdd = useCallback(async (track: ITunesTrack) => {
    if (addedTrackIdsRef.current.has(track.trackId)) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Get next position
    const { data: existingTracks } = await supabase
      .from("playlist_tracks")
      .select("position")
      .eq("user_id", user.id)
      .order("position", { ascending: false })
      .limit(1);

    const nextPosition =
      existingTracks && existingTracks.length > 0
        ? existingTracks[0].position + 1
        : 0;

    const { data: inserted } = await supabase
      .from("playlist_tracks")
      .insert({
        user_id: user.id,
        track_id: track.trackId,
        track_name: track.trackName,
        artist_name: track.artistName,
        collection_name: track.collectionName,
        artwork_url: track.artworkUrl100,
        preview_url: track.previewUrl,
        track_view_url: track.trackViewUrl,
        position: nextPosition,
      })
      .select("id")
      .single();

    setAddedTrackIds((prev) => new Set(prev).add(track.trackId));

    // Undo toast
    toast(`Added "${track.trackName}"`, {
      action: {
        label: "Undo",
        onClick: async () => {
          if (inserted) {
            await supabase
              .from("playlist_tracks")
              .delete()
              .eq("id", inserted.id);
            setAddedTrackIds((prev) => {
              const next = new Set(prev);
              next.delete(track.trackId);
              return next;
            });
          }
        },
      },
      duration: 5000,
    });
  }, []);

  // Cleanup undo timeouts
  useEffect(() => {
    const refs = undoTimeoutRefs.current;
    return () => {
      refs.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return (
    <div className="min-h-dvh flex flex-col pt-[52px] pb-24 md:pb-0">
      <Header left="muted" right="profile" />

      <div className="max-w-5xl mx-auto w-full px-4 pt-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-foreground shrink-0">
            Let&apos;s find something
          </h1>
          <div className="hidden md:flex items-center gap-2">
            <Button size="sm" onClick={() => router.push("/my")}>
              Done
            </Button>
          </div>
        </div>

        <Input
          placeholder="Search for songs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="flex-1 mt-4 max-w-5xl mx-auto w-full">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {results.map((track) => (
              <div
                key={track.trackId}
                className="border-b border-border md:border-b-0 md:rounded-lg md:hover:bg-accent/50 transition-colors"
              >
                <TrackListItem
                  track={track}
                  action={addedTrackIds.has(track.trackId) ? "added" : "add"}
                  onAdd={() => handleAdd(track)}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="flex justify-center py-8">
            <p className="text-sm text-muted-foreground">No results found</p>
          </div>
        )}
      </div>

      {/* Mobile-only fixed bottom overlay */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border px-4 py-4 space-y-2 md:hidden">
        <Button className="w-full" onClick={() => router.push("/my")}>
          Done
        </Button>
        <button
          onClick={() => router.push("/my")}
          className="w-full text-sm text-muted-foreground text-center py-2 hover:underline"
        >
          Back
        </button>
      </div>
    </div>
  );
}
