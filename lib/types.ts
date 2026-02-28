export interface Profile {
  id: string;
  handle: string;
  message: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaylistTrack {
  id: string;
  user_id: string;
  track_id: number;
  track_name: string;
  artist_name: string;
  collection_name: string | null;
  artwork_url: string | null;
  preview_url: string | null;
  track_view_url: string | null;
  position: number;
  created_at: string;
}

export interface ITunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string;
  trackViewUrl: string;
}

export interface ITunesSearchResult {
  resultCount: number;
  results: ITunesTrack[];
}
