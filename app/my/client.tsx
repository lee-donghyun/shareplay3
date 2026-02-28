"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { TrackListItem } from "@/components/track-list-item";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Profile, PlaylistTrack } from "@/lib/types";

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

  // Drag and drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);

  // Swipe to delete state
  const [swipedIndex, setSwipedIndex] = useState<number | null>(null);

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

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${profile.handle}'s Shareplay`,
        url: `${window.location.origin}/u/${profile.handle}`,
      });
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    const supabase = createClient();
    await supabase.from("playlist_tracks").delete().eq("id", trackId);
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    setSwipedIndex(null);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = useCallback(
    async (targetIndex: number) => {
      if (dragIndex === null || dragIndex === targetIndex) {
        setDragIndex(null);
        setDragOverIndex(null);
        return;
      }

      const newTracks = [...tracks];
      const [movedTrack] = newTracks.splice(dragIndex, 1);
      newTracks.splice(targetIndex, 0, movedTrack);

      // Update positions
      const updatedTracks = newTracks.map((t, i) => ({
        ...t,
        position: i,
      }));

      setTracks(updatedTracks);
      setDragIndex(null);
      setDragOverIndex(null);

      // Persist new positions
      const supabase = createClient();
      await Promise.all(
        updatedTracks.map((t) =>
          supabase
            .from("playlist_tracks")
            .update({ position: t.position })
            .eq("id", t.id)
        )
      );
    },
    [dragIndex, tracks]
  );

  // Touch-based swipe for delete
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    // Close any open swipe
    if (swipedIndex !== index) {
      setSwipedIndex(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, index: number) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -50) {
      setSwipedIndex(index);
    } else if (deltaX > 50) {
      setSwipedIndex(null);
    }
  };

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
              onClick={handleShare}
              className="text-sm text-primary hover:underline"
            >
              Share
            </button>
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
        <div className="divide-y divide-border">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className={`relative overflow-hidden transition-colors ${
                dragOverIndex === index ? "bg-accent/50" : ""
              }`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchEnd={(e) => handleTouchEnd(e, index)}
            >
              <div
                className="transition-transform duration-200"
                style={{
                  transform:
                    swipedIndex === index
                      ? "translateX(-80px)"
                      : "translateX(0)",
                }}
              >
                <TrackListItem track={track} />
              </div>
              {swipedIndex === index && (
                <button
                  onClick={() => handleDeleteTrack(track.id)}
                  className="absolute right-0 top-0 bottom-0 w-20 bg-destructive text-white flex items-center justify-center text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>

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
