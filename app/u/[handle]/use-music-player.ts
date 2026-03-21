"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaylistTrack } from "@/lib/types";

const AUDIO_FADE_DURATION_MS = 250;

function clampVolume(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function useMusicPlayer(track: PlaylistTrack | undefined) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeSequenceRef = useRef(0);
  const trackChangeSequenceRef = useRef(0);
  const isPlayingRef = useRef(false);
  const previousTrackIdRef = useRef<number | undefined>(track?.track_id);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

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
      } finally {
        setIsAudioLoading(false);
      }
    },
    [fadeVolume],
  );

  const stopWithoutFade = useCallback((audio: HTMLAudioElement) => {
    audio.pause();
    audio.currentTime = 0;
    if (audioRef.current === audio) {
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(async () => {
    if (!track?.preview_url) return;
    if (isAudioLoading) return;

    const currentAudio = audioRef.current;
    if (currentAudio) {
      if (isPlayingRef.current) {
        await fadeOutAndStop(currentAudio);
      } else {
        setIsAudioLoading(true);
        try {
          currentAudio.volume = 0;
          await currentAudio.play();
          setIsPlaying(true);
          void fadeVolume(currentAudio, 0, 1, AUDIO_FADE_DURATION_MS);
        } catch {
          setIsPlaying(false);
        } finally {
          setIsAudioLoading(false);
        }
      }
      return;
    }

    try {
      await playTrackWithFadeIn(track.preview_url);
    } catch {
      if (audioRef.current) {
        stopWithoutFade(audioRef.current);
      }
    }
  }, [
    fadeOutAndStop,
    fadeVolume,
    isAudioLoading,
    playTrackWithFadeIn,
    stopWithoutFade,
    track,
  ]);

  useEffect(() => {
    const nextTrackId = track?.track_id;
    if (previousTrackIdRef.current === nextTrackId) {
      return;
    }

    previousTrackIdRef.current = nextTrackId;
    const sequence = ++trackChangeSequenceRef.current;
    const shouldContinuePlaying = isPlayingRef.current;
    const currentAudio = audioRef.current;

    void (async () => {
      if (currentAudio) {
        if (shouldContinuePlaying) {
          await fadeOutAndStop(currentAudio);
        } else {
          stopWithoutFade(currentAudio);
        }
      }

      if (
        !shouldContinuePlaying ||
        sequence !== trackChangeSequenceRef.current
      ) {
        return;
      }

      if (!track?.preview_url) {
        setIsPlaying(false);
        return;
      }

      try {
        await playTrackWithFadeIn(track.preview_url);
      } catch {
        if (sequence === trackChangeSequenceRef.current && audioRef.current) {
          stopWithoutFade(audioRef.current);
        }
      }
    })();
  }, [fadeOutAndStop, playTrackWithFadeIn, stopWithoutFade, track]);

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

  return {
    isPlaying,
    isAudioLoading,
    togglePlay,
  };
}
