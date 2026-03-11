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

type EmbedLayout = "small" | "medium" | "large";

function useEmbedLayout(): { layout: EmbedLayout; coverSize: number } {
  const [state, setState] = useState<{ layout: EmbedLayout; coverSize: number }>(
    { layout: "medium", coverSize: 160 },
  );

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (h < 200 || w < 250) {
        setState({ layout: "small", coverSize: Math.min(w - 32, h - 48, 120) });
      } else if (h < 400 || w < 400) {
        setState({
          layout: "medium",
          coverSize: Math.min(w * 0.4, h - 80, 160),
        });
      } else {
        setState({
          layout: "large",
          coverSize: Math.min(w * 0.45, h * 0.5, 260),
        });
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return state;
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
  const { layout, coverSize } = useEmbedLayout();

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

  if (tracks.length === 0) {
    return (
      <div className="h-dvh flex items-center justify-center bg-black">
        <p className="text-muted-foreground text-sm">No tracks yet</p>
      </div>
    );
  }

  // Small layout: single album cover + track name
  if (layout === "small") {
    return (
      <div className="h-dvh flex items-center gap-3 bg-black px-3 overflow-hidden">
        {currentTrack?.artwork_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={getHighResArtwork(currentTrack.artwork_url)}
            alt={currentTrack.track_name}
            className="rounded-sm object-cover flex-shrink-0"
            style={{
              width: Math.max(coverSize, 40),
              height: Math.max(coverSize, 40),
            }}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">
            {currentTrack?.track_name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {currentTrack?.artist_name}
          </p>
        </div>
        {currentTrack?.preview_url && (
          <button
            onClick={togglePlay}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            {isPlaying ? (
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5 text-white ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>
        )}
      </div>
    );
  }

  // Medium layout: coverflow + track info below (compact)
  if (layout === "medium") {
    return (
      <div className="h-dvh flex flex-col bg-black overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full">
            <Coverflow
              covers={coverData}
              size={coverSize}
              onChange={handleCoverChange}
            />
          </div>
        </div>
        <div className="px-3 pb-3 text-center space-y-1">
          <p className="text-sm font-semibold text-foreground truncate">
            {currentTrack?.track_name}
          </p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs text-muted-foreground truncate">
              {currentTrack?.artist_name}
            </p>
            {currentTrack?.preview_url && (
              <button
                onClick={togglePlay}
                className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                {isPlaying ? (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg
                    className="w-3 h-3 text-white ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Large layout: full coverflow + track info overlay
  return (
    <div className="h-dvh flex flex-col bg-black overflow-hidden">
      <div className="px-4 pt-3">
        <a
          href={`/u/${profile.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          {profile.handle}
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full">
          <Coverflow
            covers={coverData}
            size={coverSize}
            onChange={handleCoverChange}
          />
        </div>
      </div>

      <div className="px-4 pb-4 text-center space-y-2">
        <div className="space-y-0.5">
          <p className="text-base font-semibold text-foreground truncate">
            {currentTrack?.track_name}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {currentTrack?.artist_name}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          {currentTrack?.preview_url && (
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {isPlaying ? (
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-white ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>
          )}

          {currentTrack?.track_view_url && (
            <a
              href={currentTrack.track_view_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:underline"
            >
              Play on Apple Music
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
