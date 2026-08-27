import { ObjectId } from "mongodb";

import type { Song } from "../../types/song";
import { songs, type SongDoc } from "../models";
import { mapSong } from "../mappers";

export interface SongInput {
  title: string;
  artist: string;
  youtubeId: string;
  note?: string;
  order?: number;
}

export class MongoSongRepository {
  async getSongs(ownerId: string): Promise<Song[]> {
    const docs = await songs().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapSong(doc));
  }

  async getSong(ownerId: string, id: string): Promise<Song | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await songs().findOne({ _id: new ObjectId(id), ownerId });
    return doc ? mapSong(doc) : null;
  }

  async createSong(input: SongInput, ownerId: string): Promise<Song> {
    const count = await songs().countDocuments({ ownerId });
    const doc: SongDoc = {
      _id: new ObjectId(),
      ownerId,
      title: input.title,
      artist: input.artist,
      youtubeId: input.youtubeId,
      order: input.order ?? count,
      createdAt: new Date(),
      ...(input.note ? { note: input.note } : {}),
    };
    await songs().insertOne(doc);
    return mapSong(doc);
  }

  async updateSong(ownerId: string, id: string, input: Partial<SongInput>): Promise<Song | null> {
    if (!ObjectId.isValid(id)) return null;
    const patch: Record<string, unknown> = {};
    for (const key of ["title", "artist", "youtubeId", "note", "order"] as const) {
      if (input[key] !== undefined) patch[key] = input[key];
    }
    const doc = await songs().findOneAndUpdate(
      { _id: new ObjectId(id), ownerId },
      { $set: patch },
      { returnDocument: "after" },
    );
    return doc ? mapSong(doc) : null;
  }

  async deleteSong(ownerId: string, id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await songs().deleteOne({ _id: new ObjectId(id), ownerId });
    return result.deletedCount > 0;
  }
}
