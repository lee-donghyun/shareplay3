"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { CoverData } from "@/components/coverflow";
import type { Profile, PlaylistTrack } from "@/lib/types";

const Coverflow = dynamic(
  () => import("@/components/coverflow").then((m) => m.Coverflow),
  { ssr: false },
);

function getHighResArtwork(url: string) {
  return url.replace("100x100", "600x600");
}

function useCoverSize() {
  const [size, setSize] = useState(150);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Width: fit 2.5 covers; Height: leave ~100px for track info and reflection
      const byWidth = Math.floor(w / 2.5);
      const byHeight = Math.floor((h - 100) / 2.5);
      setSize(Math.max(80, Math.min(byWidth, byHeight, 220)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

export function EmbedPageClient({
  profile,
  tracks,
}: {
  profile: Profile;
  tracks: PlaylistTrack[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const coverSize = useCoverSize();

  const coverData: CoverData[] = tracks.map((t) => ({
    src: t.artwork_url ? getHighResArtwork(t.artwork_url) : "",
    title: t.track_name,
    artist: t.artist_name,
    previewUrl: t.preview_url,
    trackViewUrl: t.track_view_url,
  }));

  const currentTrack = tracks[currentIndex];

  const togglePlay = useCallback(() => {
    if (!currentTrack?.preview_url) return;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    const audio = new Audio(currentTrack.preview_url);
    audioRef.current = audio;
    audio.play();
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
  }, [currentTrack, isPlaying]);

  const handleCoverChange = useCallback((index: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
    setCurrentIndex(index);
  }, []);

  const isSmall = coverSize < 120;

  if (tracks.length === 0) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-black">
        <p className="text-muted-foreground text-sm">{profile.handle}</p>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full flex flex-col bg-black overflow-hidden">
      {/* Coverflow area */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="w-full">
          <Coverflow
            covers={coverData}
            size={coverSize}
            onChange={handleCoverChange}
          />
        </div>
      </div>

      {/* Track info */}
      <div className="shrink-0 px-3 pb-3 pt-1 text-center space-y-1">
        <p
          className="font-semibold text-foreground leading-tight truncate"
          style={{ fontSize: isSmall ? "0.75rem" : "0.875rem" }}
        >
          {currentTrack?.track_name}
        </p>
        <p
          className="text-muted-foreground truncate"
          style={{ fontSize: isSmall ? "0.65rem" : "0.75rem" }}
        >
          {currentTrack?.artist_name}
        </p>

        <div className="flex items-center justify-center gap-3 pt-1">
          {currentTrack?.preview_url ? (
            <button
              onClick={togglePlay}
              className="flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              style={{
                width: isSmall ? 28 : 36,
                height: isSmall ? 28 : 36,
              }}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="text-white"
                  style={{ width: isSmall ? 10 : 14, height: isSmall ? 10 : 14 }}
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="text-white ml-0.5"
                  style={{ width: isSmall ? 10 : 14, height: isSmall ? 10 : 14 }}
                >
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>
          ) : null}

          {!isSmall && currentTrack?.track_view_url ? (
            <a
              href={currentTrack.track_view_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontSize: "0.7rem" }}
            >
              Apple Music ↗
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
