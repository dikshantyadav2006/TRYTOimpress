import type { Song } from "../types/song";
import { mockSongs } from "../data/mock";

export interface SongRepository {
  getSongs(): Promise<Song[]>;
}

export class MockSongRepository implements SongRepository {
  private readonly songs: Song[] = [...mockSongs];

  async getSongs(): Promise<Song[]> {
    return [...this.songs].sort((a, b) => a.order - b.order);
  }
}
