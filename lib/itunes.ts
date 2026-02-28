import type { ITunesSearchResult } from "./types";

export async function searchTracks(
  term: string,
  limit: number = 10
): Promise<ITunesSearchResult> {
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(
      term
    )}&entity=song&limit=${limit}`
  );
  if (!res.ok) {
    throw new Error("iTunes search failed");
  }
  return res.json();
}
