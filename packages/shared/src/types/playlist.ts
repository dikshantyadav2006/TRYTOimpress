export type MusicMood = "love" | "miss-you" | "sad" | "rain" | "night";

export interface PlaylistSong {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
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