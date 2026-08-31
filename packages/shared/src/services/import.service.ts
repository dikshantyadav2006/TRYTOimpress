import {
  getYouTubeThumbnail,
  isYouTubeUrl,
  parseYouTubeId,
  parseYouTubePlaylistId,
} from "../utils/youtube";
import type { PlaylistMode, PlaylistProvider, PlaylistSong } from "../types/playlist";

export interface ImportedTrack {
  title: string;
  artist: string;
  youtubeId?: string;
  thumbnail?: string;
  duration?: number;
}

export interface ImportedPlaylist {
  name: string;
  description?: string;
  mode: PlaylistMode;
  provider: PlaylistProvider;
  providerPlaylistId?: string;
  coverImage?: string;
  songs: PlaylistSong[];
}

/**
 * A playlist provider adapter. Adding a new provider (Spotify, SoundCloud, …)
 * only requires implementing this interface and registering it in `createProvider`.
 * This keeps the import pipeline decoupled from any single source.
 */
export interface PlaylistProviderAdapter {
  readonly id: PlaylistProvider;
  canHandle(url: string): boolean;
  fetch(url: string, ownerId: string): Promise<ImportedPlaylist>;
}

export class YouTubePlaylistProvider implements PlaylistProviderAdapter {
  readonly id: PlaylistProvider = "youtube";

  canHandle(url: string): boolean {
    return isYouTubeUrl(url);
  }

  async fetch(url: string, _ownerId: string): Promise<ImportedPlaylist> {
    const playlistId = parseYouTubePlaylistId(url);
    if (!playlistId) {
      throw new PlaylistImportError("invalid_youtube_playlist");
    }

    const videos = await fetchYouTubePlaylist(playlistId);
    if (videos.length === 0) {
      throw new PlaylistImportError("empty_playlist");
    }

    const songs: PlaylistSong[] = videos.map((video, index) => ({
      id: `yt-${video.id}`,
      title: video.title,
      artist: video.author ?? "YouTube",
      youtubeId: video.id,
      ...(video.thumbnail ? { thumbnail: video.thumbnail } : {}),
      ...(video.duration ? { duration: video.duration } : {}),
      order: index,
      plays: 0,
      skips: 0,
    }));

    return {
      name: videos[0]?.playlistTitle ?? "YouTube Playlist",
      description: videos[0]?.playlistDescription,
      mode: "video",
      provider: "youtube",
      providerPlaylistId: playlistId,
      coverImage: songs[0]?.thumbnail,
      songs,
    };
  }
}

export class PlaylistImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlaylistImportError";
  }
}

interface YouTubeVideo {
  id: string;
  title: string;
  author?: string;
  thumbnail?: string;
  duration?: number;
  playlistTitle?: string;
  playlistDescription?: string;
}

/** Fetches a public YouTube playlist without an API key via YouTube's oEmbed/player endpoints. */
export async function fetchYouTubePlaylist(playlistId: string): Promise<YouTubeVideo[]> {
  const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
  const html = await fetchText(playlistUrl);

  const title =
    html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1] ??
    html.match(/<title>([^<]+)<\/title>/i)?.[1] ??
    "YouTube Playlist";
  const description =
    html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)?.[1] ??
    html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1];

  const videos: YouTubeVideo[] = [];

  // The playlist page embeds each video id in `{"playlistId":"...","videoId":"..."}` patterns.
  const seen = new Set<string>();
  const idPattern =
    /"videoId":"([A-Za-z0-9_-]{11})"(?:[^}]*?"index":(\d+))?|"index":(\d+)[^}]*?"videoId":"([A-Za-z0-9_-]{11})"/g;
  let m: RegExpExecArray | null;
  while ((m = idPattern.exec(html)) !== null) {
    const videoId = m[1] ?? m[4];
    if (!videoId || seen.has(videoId)) continue;
    seen.add(videoId);
    videos.push({ id: videoId, title: `Video ${seen.size}`, playlistTitle: title });
  }

  // If the page didn't expose video ids (e.g. bot walls), fall back to the RSS feed.
  if (videos.length === 0) {
    return fetchYouTubePlaylistRss(playlistId, title, description);
  }

  // Enrich each video with title, author, thumbnail and duration.
  return enrichVideos(videos).then((enriched) =>
    enriched.map((video, index) => ({
      ...video,
      playlistTitle: title,
      ...(description ? { playlistDescription: description } : {}),
      ...(index === 0 ? {} : {}),
    })),
  );
}

async function fetchYouTubePlaylistRss(
  playlistId: string,
  playlistTitle: string,
  playlistDescription?: string,
): Promise<YouTubeVideo[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
  const xml = await fetchText(rssUrl);
  if (!xml.trim()) return [];

  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  const videos: YouTubeVideo[] = entries.map((entry) => {
    const videoId = entry.match(/<yt:videoId>([A-Za-z0-9_-]{11})<\/yt:videoId>/)?.[1] ?? "";
    const title =
      xmlDecode(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "Unknown") ??
      "Unknown";
    const author =
      xmlDecode(entry.match(/<name>([\s\S]*?)<\/name>/)?.[1] ?? "YouTube") ?? "YouTube";
    return {
      id: videoId,
      title,
      author,
      thumbnail: videoId ? getYouTubeThumbnail(videoId) : undefined,
      playlistTitle,
      ...(playlistDescription ? { playlistDescription } : {}),
    };
  });

  const enriched = await enrichVideos(videos);
  // Duration is not in the RSS feed; rely on enrichment result.
  return enriched;
}

async function enrichVideos(
  videos: YouTubeVideo[],
): Promise<YouTubeVideo[]> {
  const results: YouTubeVideo[] = [];
  // Process in small batches to be polite to YouTube and avoid rate limiting.
  for (const video of videos) {
    try {
      const oembed = await fetchJson<{
        title?: string;
        author_name?: string;
        thumbnail_url?: string;
      }>(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${video.id}`);
      const duration = await fetchVideoDuration(video.id).catch(() => undefined);
      results.push({
        ...video,
        title: oembed?.title ?? video.title,
        author: oembed?.author_name ?? video.author ?? "YouTube",
        thumbnail: oembed?.thumbnail_url ?? video.thumbnail,
        ...(duration ? { duration } : {}),
      });
    } catch {
      results.push(video);
    }
  }
  return results;
}

async function fetchVideoDuration(videoId: string): Promise<number | undefined> {
  // Use the innertube player endpoint (public, no API key) to read the lengthSeconds.
  const body = await fetchText(
    `https://www.youtube.com/youtubei/v1/player?key=AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId,
        context: { client: { clientName: "WEB", clientVersion: "2.20231201.04.00" } },
      }),
    },
  ).catch(() => "");
  const seconds = body.match(/"lengthSeconds":"(\d+)"/)?.[1];
  return seconds ? Number.parseInt(seconds, 10) : undefined;
}

function xmlDecode(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const text = await fetchText(url);
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function fetchText(
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string },
): Promise<string> {
  // fetch is available in Node 20+ (the engine required by this repo).
  const response = await fetch(url, {
    method: init?.method ?? "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      ...(init?.headers ?? {}),
    },
    ...(init?.body ? { body: init.body } : {}),
  });
  if (!response.ok) {
    throw new PlaylistImportError(`http_${response.status}`);
  }
  return response.text();
}

/** Dispatches to the first provider that can handle the given URL. */
export function parseImportUrl(url: string): {
  provider: YouTubePlaylistProvider;
  playlistId: string;
} {
  const youtube = new YouTubePlaylistProvider();
  if (youtube.canHandle(url)) {
    const playlistId = parseYouTubePlaylistId(url);
    if (!playlistId) throw new PlaylistImportError("invalid_youtube_playlist");
    return { provider: youtube, playlistId };
  }
  throw new PlaylistImportError("unsupported_provider");
}

export const playlistProviders: PlaylistProviderAdapter[] = [new YouTubePlaylistProvider()];

export function getProvider(url: string): PlaylistProviderAdapter {
  const provider = playlistProviders.find((candidate) => candidate.canHandle(url));
  if (!provider) throw new PlaylistImportError("unsupported_provider");
  return provider;
}
