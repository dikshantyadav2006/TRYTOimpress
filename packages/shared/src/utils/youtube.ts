const YOUTUBE_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?.*v=)([A-Za-z0-9_-]{11})/,
  /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  /^([A-Za-z0-9_-]{11})$/,
];

export function parseYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  for (const pattern of YOUTUBE_ID_PATTERNS) {
    const match = trimmed.match(pattern);
    const videoId = match?.[1];
    if (videoId) return videoId;
  }
  return null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

const YOUTUBE_PLAYLIST_PATTERNS = [
  /(?:youtube\.com|youtu\.be|music\.youtube\.com)\/playlist\?.*list=([A-Za-z0-9_-]+)/i,
  /(?:youtube\.com|youtu\.be|music\.youtube\.com)\/watch\?.*list=([A-Za-z0-9_-]+)/i,
  /^(?:https?:\/\/)?(?:m\.|music\.)?youtube\.com\/(?:playlist|watch)\?[^#]*list=([A-Za-z0-9_-]+)/i,
  /^([A-Za-z0-9_-]+)$/,
];

/**
 * Extracts the `list` query parameter from a YouTube URL. Never validates the
 * ID length — a short playlist ID is perfectly valid (the source API confirms
 * it). Accepts bare IDs, full URLs and every host variant (m., music.).
 */
export function parseYouTubePlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Prefer URL parsing so `?list=` is the single source of truth. `new URL`
  // silently normalises m./music./www. hosts and ignores unrelated params.
  try {
    const url = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
    const list = url.searchParams.get("list");
    if (list) return list;
  } catch {
    // fall through to pattern matching below
  }

  for (const pattern of YOUTUBE_PLAYLIST_PATTERNS) {
    const match = trimmed.match(pattern);
    const playlistId = match?.[1];
    if (playlistId) return playlistId;
  }
  return null;
}

/** The canonical, normalised source URL for a YouTube playlist, or null. */
export function parseYouTubePlaylistSourceUrl(input: string): string | null {
  const playlistId = parseYouTubePlaylistId(input);
  return playlistId ? `https://www.youtube.com/playlist?list=${playlistId}` : null;
}

export function isYouTubeUrl(input: string): boolean {
  return /youtube\.com|youtu\.be/i.test(input.trim()) || parseYouTubePlaylistId(input) !== null;
}
