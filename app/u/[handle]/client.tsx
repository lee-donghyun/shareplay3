"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import type { CoverData } from "@/components/coverflow";
import { createClient } from "@/lib/supabase/client";
import type { Profile, PlaylistTrack } from "@/lib/types";

const AUDIO_FADE_DURATION_MS = 250;

function clampVolume(value: number) {
  return Math.max(0, Math.min(1, value));
}

// bundle-dynamic-imports: Coverflow pulls in @react-spring/web + @use-gesture/react (~40kB)
const Coverflow = dynamic(
  () => import("@/components/coverflow").then((m) => m.Coverflow),
  { ssr: false },
);

function useResponsiveCoverSize() {
  const [size, setSize] = useState(200);

  useEffect(() => {
    const calculate = () => {
      const isMd = window.matchMedia("(min-width: 768px)").matches;
      const contentWidth = Math.max(0, Math.min(window.innerWidth, 672) - 32);
      const widthBasedSize = contentWidth * 0.55;
      const reservedHeight = isMd ? 360 : 300;
      const availableHeight = Math.max(0, window.innerHeight - reservedHeight);
      const heightBasedSize = availableHeight * 0.9;
      const nextSize = Math.round(
        Math.max(200, Math.min(widthBasedSize, heightBasedSize)),
      );
      setSize(nextSize);
    };

    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, []);

  return size;
}

function getHighResArtwork(url: string) {
  return url.replace("100x100", "600x600");
}

export function ProfilePageClient({
  profile,
  tracks,
}: {
  profile: Profile;
  tracks: PlaylistTrack[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [addedTracks, setAddedTracks] = useState<Set<number>>(new Set());
  const [isOwner, setIsOwner] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeSequenceRef = useRef(0);
  const trackChangeSequenceRef = useRef(0);
  const coverSize = useResponsiveCoverSize();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && user.id === profile.id) {
        setIsOwner(true);
      }
    });
  }, [profile.id]);

  useEffect(() => {
    return () => {
      // Cancel in-flight fades/track switches and stop playback on page leave.
      fadeSequenceRef.current += 1;
      trackChangeSequenceRef.current += 1;

      const audio = audioRef.current;
      if (!audio) return;

      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
      setIsAudioLoading(false);
    };
  }, []);

  const coverData: CoverData[] = tracks.map((t) => ({
    src: t.artwork_url ? getHighResArtwork(t.artwork_url) : "",
    title: t.track_name,
    artist: t.artist_name,
    previewUrl: t.preview_url,
    trackViewUrl: t.track_view_url,
  }));

  const currentTrack = tracks[currentIndex];

  const fadeVolume = useCallback(
    (audio: HTMLAudioElement, from: number, to: number, durationMs: number) => {
      const sequence = ++fadeSequenceRef.current;
      const startVolume = clampVolume(from);
      const endVolume = clampVolume(to);

      audio.volume = startVolume;

      return new Promise<void>((resolve) => {
        if (durationMs <= 0 || startVolume === endVolume) {
          audio.volume = endVolume;
          resolve();
          return;
        }

        const start = performance.now();
        const tick = (now: number) => {
          if (sequence !== fadeSequenceRef.current) {
            resolve();
            return;
          }

          const progress = Math.min(1, (now - start) / durationMs);
          const nextVolume = startVolume + (endVolume - startVolume) * progress;
          audio.volume = clampVolume(nextVolume);

          if (progress < 1) {
            requestAnimationFrame(tick);
            return;
          }

          resolve();
        };

        requestAnimationFrame(tick);
      });
    },
    [],
  );

  const fadeOutAndStop = useCallback(
    async (audio: HTMLAudioElement) => {
      const currentVolume = audio.volume;
      await fadeVolume(audio, currentVolume, 0, AUDIO_FADE_DURATION_MS);
      audio.pause();
      audio.currentTime = 0;

      if (audioRef.current === audio) {
        audioRef.current = null;
      }

      setIsPlaying(false);
      setIsAudioLoading(false);
    },
    [fadeVolume],
  );

  const playTrackWithFadeIn = useCallback(
    async (previewUrl: string) => {
      setIsAudioLoading(true);
      const audio = new Audio(previewUrl);
      audio.volume = 0;
      audioRef.current = audio;
      try {
        await audio.play();
        setIsPlaying(true);
        audio.onended = () => {
          if (audioRef.current === audio) {
            audioRef.current = null;
            setIsPlaying(false);
            setIsAudioLoading(false);
          }
        };
        void fadeVolume(audio, 0, 1, AUDIO_FADE_DURATION_MS);
      } catch {
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
        setIsPlaying(false);
        throw new Error("Failed to start audio playback");
      } finally {
        setIsAudioLoading(false);
      }
    },
    [fadeVolume],
  );

  const togglePlay = useCallback(async () => {
    if (!currentTrack?.preview_url) return;
    if (isAudioLoading) return;

    if (audioRef.current) {
      if (isPlaying) {
        await fadeOutAndStop(audioRef.current);
      } else {
        setIsAudioLoading(true);
        try {
          audioRef.current.volume = 0;
          await audioRef.current.play();
          setIsPlaying(true);
          fadeVolume(audioRef.current, 0, 1, AUDIO_FADE_DURATION_MS);
        } catch {
          setIsPlaying(false);
        } finally {
          setIsAudioLoading(false);
        }
      }
      return;
    }

    await playTrackWithFadeIn(currentTrack.preview_url);
  }, [
    currentTrack,
    fadeOutAndStop,
    fadeVolume,
    isAudioLoading,
    isPlaying,
    playTrackWithFadeIn,
  ]);

  // rerender-move-effect-to-event: stop audio in the change handler, not an effect
  const handleCoverChange = useCallback(
    (index: number) => {
      const sequence = ++trackChangeSequenceRef.current;
      const selectedTrack = tracks[index];
      const shouldContinuePlaying = isPlaying;
      const currentAudio = audioRef.current;

      setCurrentIndex(index);

      void (async () => {
        if (currentAudio) {
          if (shouldContinuePlaying) {
            await fadeOutAndStop(currentAudio);
          } else {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            if (audioRef.current === currentAudio) {
              audioRef.current = null;
            }
            setIsPlaying(false);
          }
        }

        if (
          !shouldContinuePlaying ||
          sequence !== trackChangeSequenceRef.current
        ) {
          return;
        }

        if (!selectedTrack?.preview_url) {
          setIsPlaying(false);
          return;
        }

        try {
          await playTrackWithFadeIn(selectedTrack.preview_url);
        } catch {
          if (sequence === trackChangeSequenceRef.current) {
            audioRef.current = null;
            setIsPlaying(false);
          }
        }
      })();
    },
    [fadeOutAndStop, isPlaying, playTrackWithFadeIn, tracks],
  );

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${profile.handle}'s Shareplay`,
        url: window.location.href,
      });
    }
  };

  const handleAddToMyShareplay = async () => {
    if (!currentTrack) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    // Get current max position
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

    await supabase.from("playlist_tracks").insert({
      user_id: user.id,
      track_id: currentTrack.track_id,
      track_name: currentTrack.track_name,
      artist_name: currentTrack.artist_name,
      collection_name: currentTrack.collection_name,
      artwork_url: currentTrack.artwork_url,
      preview_url: currentTrack.preview_url,
      track_view_url: currentTrack.track_view_url,
      position: nextPosition,
    });

    setAddedTracks((prev) => new Set(prev).add(currentTrack.track_id));
  };

  return (
    <div className="h-dvh flex flex-col bg-black pt-[52px] overflow-hidden">
      <Header left="muted" right="profile" />

      <div className="max-w-2xl mx-auto w-full px-4 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {profile.handle}
            </h1>
            {profile.message ? (
              <p className="text-sm text-muted-foreground mt-1">
                {profile.message}
              </p>
            ) : null}
          </div>
          {isOwner && (
            <Button variant="link" onClick={handleShare}>
              Share
            </Button>
          )}
        </div>
      </div>

      {tracks.length > 0 ? (
        <>
          <div className="flex-1 flex items-center pb-36 md:pb-48">
            <div className="w-full relative">
              <Coverflow
                covers={coverData}
                size={coverSize}
                onSelected={handleCoverChange}
              />
            </div>
          </div>

          {/* Track info overlay */}
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <div className="max-w-2xl mx-auto px-6 pb-5 md:pb-8 pt-3 md:pt-4 space-y-2 md:space-y-4 bg-gradient-to-t from-black via-black/80 to-black/40 backdrop-blur-sm rounded-4xl">
              <div className="text-center space-y-1">
                <p className="text-lg font-semibold text-foreground">
                  {currentTrack?.track_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentTrack?.artist_name}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 md:gap-3">
                {currentTrack?.preview_url ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    disabled={isAudioLoading}
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
                  >
                    {isAudioLoading ? (
                      <svg
                        className="w-5 h-5 text-white animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-90"
                          fill="currentColor"
                          d="M22 12a10 10 0 0 0-10-10v3a7 7 0 0 1 7 7h3z"
                        />
                      </svg>
                    ) : isPlaying ? (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-white ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    )}
                  </Button>
                ) : null}

                <Button variant="link" onClick={handleAddToMyShareplay}>
                  {addedTracks.has(currentTrack?.track_id)
                    ? "Added to Shareplay"
                    : "Add to my Shareplay"}
                </Button>

                {currentTrack?.track_view_url ? (
                  <a
                    href={currentTrack.track_view_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    Play on Apple Music
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No tracks yet</p>
        </div>
      )}
    </div>
  );
}
