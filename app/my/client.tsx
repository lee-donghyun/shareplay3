"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDrag } from "@use-gesture/react";
import { animated, useSprings } from "@react-spring/web";
import { Header } from "@/components/header";
import { TrackListItem } from "@/components/track-list-item";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Profile, PlaylistTrack } from "@/lib/types";

const SWIPE_THRESHOLD = 50;
const DELETE_BUTTON_WIDTH = 80;
const ITEM_HEIGHT = 72;

function swap<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [val] = copy.splice(from, 1);
  copy.splice(to, 0, val);
  return copy;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(n, max));
}

function TrackList({
  tracks,
  onDelete,
  onReorder,
}: {
  tracks: PlaylistTrack[];
  onDelete: (id: string) => void;
  onReorder: (newTracks: PlaylistTrack[]) => void;
}) {
  const order = useRef(tracks.map((_, i) => i));
  const swipedState = useRef(tracks.map(() => false));
  const tracksRef = useRef(tracks);

  useLayoutEffect(() => {
    tracksRef.current = tracks;
  });

  const [springs, api] = useSprings(tracks.length, (i) => ({
    y: i * ITEM_HEIGHT,
    x: 0,
    scale: 1,
    zIndex: 0,
    shadow: 0,
    config: { tension: 300, friction: 30 },
  }));

  const trackIds = tracks.map((t) => t.id).join(",");
  useLayoutEffect(() => {
    order.current = tracks.map((_, i) => i);
    swipedState.current = tracks.map(() => false);
    api.set((i) => ({
      y: i * ITEM_HEIGHT,
      x: 0,
      scale: 1,
      zIndex: 0,
      shadow: 0,
    }));
  }, [trackIds, api, tracks]);

  // Y-axis drag for reorder (handle only)
  const handleBind = useDrag(
    ({ args: [originalIndex], active, movement: [, my] }) => {
      const idx = originalIndex as number;
      const curIndex = order.current.indexOf(idx);
      const curRow = clamp(
        Math.round((curIndex * ITEM_HEIGHT + my) / ITEM_HEIGHT),
        0,
        tracksRef.current.length - 1,
      );
      const newOrder = swap(order.current, curIndex, curRow);

      // Close any swiped item when starting drag
      swipedState.current.forEach((s, i) => {
        if (s) {
          swipedState.current[i] = false;
          api.start((j) => (j === i ? { x: 0, immediate: false } : {}));
        }
      });

      api.start((i) => {
        if (active && i === idx) {
          return {
            y: curIndex * ITEM_HEIGHT + my,
            scale: 1.03,
            zIndex: 1,
            shadow: 8,
            immediate: (key: string) => key === "y" || key === "zIndex",
          };
        }
        return {
          y: newOrder.indexOf(i) * ITEM_HEIGHT,
          scale: 1,
          zIndex: 0,
          shadow: 0,
          immediate: false,
        };
      });

      if (!active) {
        order.current = newOrder;
        const reordered = newOrder.map((i) => tracksRef.current[i]);
        onReorder(reordered);
      }
    },
    {
      axis: "y",
      filterTaps: true,
    },
  );

  // X-axis swipe for delete (item body)
  const swipeBind = useDrag(
    ({
      args: [originalIndex],
      active,
      movement: [mx],
      last,
      direction: [dx],
      cancel,
    }) => {
      const idx = originalIndex as number;
      const isSwiped = swipedState.current[idx];
      const effectiveX = isSwiped ? -DELETE_BUTTON_WIDTH + mx : mx;

      if (active && Math.abs(effectiveX) > 200) {
        cancel();
      }

      // Close any other swiped item
      swipedState.current.forEach((s, i) => {
        if (s && i !== idx) {
          swipedState.current[i] = false;
          api.start((j) => (j === i ? { x: 0, immediate: false } : {}));
        }
      });

      if (last) {
        if (effectiveX < -SWIPE_THRESHOLD && dx < 0) {
          swipedState.current[idx] = true;
          api.start((i) =>
            i === idx ? { x: -DELETE_BUTTON_WIDTH, immediate: false } : {},
          );
        } else {
          swipedState.current[idx] = false;
          api.start((i) => (i === idx ? { x: 0, immediate: false } : {}));
        }
      } else {
        api.start((i) =>
          i === idx ? { x: Math.min(0, effectiveX), immediate: true } : {},
        );
      }
    },
    {
      axis: "x",
      filterTaps: true,
    },
  );

  if (tracks.length === 0) return null;

  return (
    <div className="relative" style={{ height: tracks.length * ITEM_HEIGHT }}>
      {springs.map(({ y, x, scale, zIndex, shadow }, i) => (
        <animated.div
          key={i}
          className="absolute w-full origin-center overflow-hidden bg-background"
          style={{
            y,
            scale,
            zIndex,
            height: ITEM_HEIGHT,
            boxShadow: shadow.to(
              (s) => `rgba(0, 0, 0, 0.12) 0px ${s}px ${2 * s}px 0px`,
            ),
          }}
        >
          <animated.div {...swipeBind(i)} style={{ x, touchAction: "pan-y" }}>
            <TrackListItem track={tracks[i]} dragHandleProps={handleBind(i)} />
          </animated.div>
          <animated.div
            className="absolute right-0 top-0 bottom-0 flex items-center justify-center"
            style={{
              width: x.to(
                (xv) => `${Math.min(Math.abs(xv), DELETE_BUTTON_WIDTH)}px`,
              ),
              opacity: x.to((xv) =>
                Math.min(Math.abs(xv) / DELETE_BUTTON_WIDTH, 1),
              ),
            }}
          >
            <button
              onClick={() => onDelete(tracks[i].id)}
              className="h-full w-full bg-destructive text-white flex items-center justify-center text-sm font-medium"
            >
              Delete
            </button>
          </animated.div>
        </animated.div>
      ))}
    </div>
  );
}

export function MyPageClient({
  profile: initialProfile,
  initialTracks,
}: {
  profile: Profile;
  initialTracks: PlaylistTrack[];
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [tracks, setTracks] = useState(initialTracks);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editHandle, setEditHandle] = useState(profile.handle);
  const [editMessage, setEditMessage] = useState(profile.message);
  const [saving, setSaving] = useState(false);

  const handleEditProfile = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        handle: editHandle,
        message: editMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, handle: editHandle, message: editMessage });
      setEditModalOpen(false);
    }
    setSaving(false);
  };

  const handleDeleteTrack = useCallback(async (trackId: string) => {
    const supabase = createClient();
    await supabase.from("playlist_tracks").delete().eq("id", trackId);
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  }, []);

  const handleReorder = useCallback(async (newTracks: PlaylistTrack[]) => {
    const updatedTracks = newTracks.map((t, i) => ({ ...t, position: i }));
    setTracks(updatedTracks);

    const supabase = createClient();
    await Promise.all(
      updatedTracks.map((t) =>
        supabase
          .from("playlist_tracks")
          .update({ position: t.position })
          .eq("id", t.id),
      ),
    );
  }, []);

  return (
    <div className="min-h-dvh flex flex-col">
      <Header left="muted" right="profile" />

      <div className="px-4 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {profile.handle}
            </h1>
            {profile.message && (
              <p className="text-sm text-muted-foreground mt-1">
                {profile.message}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditModalOpen(true)}
              className="text-sm text-primary hover:underline"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 mt-6">
        <TrackList
          tracks={tracks}
          onDelete={handleDeleteTrack}
          onReorder={handleReorder}
        />

        <div className="px-4 py-6">
          <button
            onClick={() => router.push("/my/search")}
            className="text-sm text-primary hover:underline"
          >
            Find more
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 bg-card rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Edit Profile
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Handle
              </label>
              <Input
                value={editHandle}
                onChange={(e) => setEditHandle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Message
              </label>
              <Textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setEditHandle(profile.handle);
                  setEditMessage(profile.message);
                  setEditModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditProfile} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
