export type MusicMood = "love" | "miss-you" | "sad" | "rain" | "night";

export type PlaylistMode = "video" | "audio";

export type PlaylistProvider = "youtube" | "manual";

export interface PlaylistSong {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  thumbnail?: string;
  duration?: number;
  mood?: MusicMood;
  note?: string;
  order: number;
  plays: number;
  skips: number;
}

export interface PlaylistTheme {
  overlayColor: string;
  textColor: string;
  accentColor: string;
}

export interface Playlist {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  mode: PlaylistMode;
  provider: PlaylistProvider;
  providerPlaylistId?: string;
  backgrounds: string[];
  theme: PlaylistTheme;
  quotes: string[];
  mood: MusicMood;
  recommendedSlugs?: string[];
  songs: PlaylistSong[];
  plays: number;
  likes: number;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
