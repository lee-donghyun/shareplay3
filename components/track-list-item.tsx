"use client";

import type { PlaylistTrack, ITunesTrack } from "@/lib/types";

interface TrackListItemProps {
  track: PlaylistTrack | ITunesTrack;
  action?: "add" | "added" | "none";
  onAdd?: () => void;
  onDelete?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

function isITunesTrack(
  track: PlaylistTrack | ITunesTrack,
): track is ITunesTrack {
  return "trackId" in track;
}

export function TrackListItem({
  track,
  action = "none",
  onAdd,
  onDelete,
  dragHandleProps,
}: TrackListItemProps) {
  const artworkUrl = isITunesTrack(track)
    ? track.artworkUrl100
    : track.artwork_url;
  const trackName = isITunesTrack(track) ? track.trackName : track.track_name;
  const artistName = isITunesTrack(track)
    ? track.artistName
    : track.artist_name;

  return (
    <div className="group flex items-center gap-3 py-3 px-4">
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="shrink-0 cursor-grab active:cursor-grabbing touch-none text-muted-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </div>
      )}
      {artworkUrl ? (
        <img
          src={artworkUrl}
          alt={trackName}
          className="w-12 h-12 rounded-md object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0">
          <span className="text-xs text-muted-foreground">♪</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {trackName}
        </p>
        <p className="text-xs text-muted-foreground truncate">{artistName}</p>
      </div>
      {action === "add" && (
        <button
          onClick={onAdd}
          className="text-sm text-primary font-medium shrink-0 hover:underline"
        >
          Add
        </button>
      )}
      {action === "added" && (
        <span className="text-sm text-muted-foreground shrink-0">Added</span>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="hidden md:block text-sm text-destructive font-medium shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
          aria-label={`Delete ${trackName}`}
        >
          Delete
        </button>
      )}
    </div>
  );
}
