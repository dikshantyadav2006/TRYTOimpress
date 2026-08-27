export interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  note?: string;
  order: number;
  createdAt: string;
}
