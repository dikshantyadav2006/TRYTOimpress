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
  /(?:youtube\.com\/playlist\?.*list=)([A-Za-z0-9_-]{13,})/,
  /(?:youtube\.com\/watch\?.*list=)([A-Za-z0-9_-]{13,})/,
  /youtu\.be\/([A-Za-z0-9_-]{13,})/,
  /^([A-Za-z0-9_-]{13,})$/,
];

export function parseYouTubePlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  for (const pattern of YOUTUBE_PLAYLIST_PATTERNS) {
    const match = trimmed.match(pattern);
    const playlistId = match?.[1];
    if (playlistId) return playlistId;
  }
  return null;
}

export function isYouTubeUrl(input: string): boolean {
  return /youtube\.com|youtu\.be/i.test(input.trim()) || parseYouTubePlaylistId(input) !== null;
}
