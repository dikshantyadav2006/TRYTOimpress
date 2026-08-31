import { ObjectId } from "mongodb";

import type {
  MusicMood,
  Playlist,
  PlaylistMode,
  PlaylistProvider,
  PlaylistSong,
} from "../../types/playlist";
import { playlists, type PlaylistDoc } from "../models";
import { mapPlaylist } from "../mappers";

export interface PlaylistSongInput {
  id?: string;
  title: string;
  artist: string;
  youtubeId: string;
  thumbnail?: string;
  duration?: number;
  mood?: MusicMood;
  note?: string;
  order?: number;
}

export interface PlaylistInput {
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  mode?: PlaylistMode;
  provider?: PlaylistProvider;
  providerPlaylistId?: string;
  sourceUrl?: string;
  backgrounds: string[];
  theme: { overlayColor: string; textColor: string; accentColor: string };
  quotes: string[];
  mood: MusicMood;
  recommendedSlugs?: string[];
  songs: PlaylistSongInput[];
  order?: number;
  published?: boolean;
}

function mapSongInputs(input: PlaylistSongInput[]): PlaylistSong[] {
  return input.map((song, index) => ({
    id: song.id ?? new ObjectId().toString(),
    title: song.title,
    artist: song.artist,
    youtubeId: song.youtubeId,
    ...(song.thumbnail ? { thumbnail: song.thumbnail } : {}),
    ...(song.duration ? { duration: song.duration } : {}),
    ...(song.mood ? { mood: song.mood } : {}),
    ...(song.note ? { note: song.note } : {}),
    order: song.order ?? index,
    plays: 0,
    skips: 0,
  }));
}

export class MongoPlaylistRepository {
  async list(ownerId: string): Promise<Playlist[]> {
    const docs = await playlists().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapPlaylist(doc));
  }

  async listPublic(ownerId: string): Promise<Playlist[]> {
    const docs = await playlists()
      .find({ ownerId, published: true })
      .sort({ order: 1, createdAt: 1 })
      .toArray();
    return docs.map((doc) => mapPlaylist(doc));
  }

  async getById(ownerId: string, id: string): Promise<Playlist | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await playlists().findOne({ _id: new ObjectId(id), ownerId });
    return doc ? mapPlaylist(doc) : null;
  }

  async getBySlug(ownerId: string, slug: string, publishedOnly?: boolean): Promise<Playlist | null> {
    const doc = await playlists().findOne({
      ownerId,
      slug,
      ...(publishedOnly ? { published: true } : {}),
    });
    return doc ? mapPlaylist(doc) : null;
  }

  async slugExists(ownerId: string, slug: string, excludeId?: string): Promise<boolean> {
    const doc = await playlists().findOne({
      ownerId,
      slug,
      ...(excludeId && ObjectId.isValid(excludeId) ? { _id: { $ne: new ObjectId(excludeId) } } : {}),
    });
    return Boolean(doc);
  }

  async create(input: PlaylistInput, ownerId: string): Promise<Playlist> {
    const count = await playlists().countDocuments({ ownerId });
    const now = new Date();
    const doc: PlaylistDoc = {
      _id: new ObjectId(),
      ownerId,
      name: input.name,
      slug: input.slug,
      mode: input.mode ?? "video",
      provider: input.provider ?? "manual",
      backgrounds: [...(input.backgrounds ?? [])],
      theme: {
        overlayColor: input.theme.overlayColor,
        textColor: input.theme.textColor,
        accentColor: input.theme.accentColor,
      },
      quotes: [...input.quotes],
      mood: input.mood,
      songs: mapSongInputs(input.songs),
      plays: 0,
      likes: 0,
      order: input.order ?? count,
      published: input.published ?? true,
      createdAt: now,
      updatedAt: now,
      ...(input.description ? { description: input.description } : {}),
      ...(input.coverImage ? { coverImage: input.coverImage } : {}),
      ...(input.providerPlaylistId ? { providerPlaylistId: input.providerPlaylistId } : {}),
      ...(input.sourceUrl ? { sourceUrl: input.sourceUrl } : {}),
      ...(input.recommendedSlugs?.length ? { recommendedSlugs: [...input.recommendedSlugs] } : {}),
    };
    await playlists().insertOne(doc);
    return mapPlaylist(doc);
  }

  async update(ownerId: string, id: string, input: Partial<PlaylistInput>): Promise<Playlist | null> {
    if (!ObjectId.isValid(id)) return null;
    const patch: Record<string, unknown> = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.slug !== undefined) patch.slug = input.slug;
    if (input.description !== undefined) patch.description = input.description;
    if (input.coverImage !== undefined) patch.coverImage = input.coverImage;
    if (input.backgrounds !== undefined) patch.backgrounds = [...input.backgrounds];
    if (input.quotes !== undefined) patch.quotes = [...input.quotes];
    if (input.mood !== undefined) patch.mood = input.mood;
    if (input.mode !== undefined) patch.mode = input.mode;
    if (input.provider !== undefined) patch.provider = input.provider;
    if (input.providerPlaylistId !== undefined) patch.providerPlaylistId = input.providerPlaylistId;
    if (input.sourceUrl !== undefined) patch.sourceUrl = input.sourceUrl;
    if (input.recommendedSlugs !== undefined)
      patch.recommendedSlugs = input.recommendedSlugs?.length ? [...input.recommendedSlugs] : [];
    if (input.songs !== undefined) patch.songs = mapSongInputs(input.songs);
    if (input.order !== undefined) patch.order = input.order;
    if (input.published !== undefined) patch.published = input.published;
    if (input.theme !== undefined) patch.theme = { ...input.theme };
    if (Object.keys(patch).length > 0) patch.updatedAt = new Date();
    const doc = await playlists().findOneAndUpdate(
      { _id: new ObjectId(id), ownerId },
      { $set: patch },
      { returnDocument: "after" },
    );
    return doc ? mapPlaylist(doc) : null;
  }

  async delete(ownerId: string, id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await playlists().deleteOne({ _id: new ObjectId(id), ownerId });
    return result.deletedCount > 0;
  }

  async deleteMany(ownerId: string, ids: string[]): Promise<number> {
    const validIds = ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
    if (validIds.length === 0) return 0;
    const result = await playlists().deleteMany({ _id: { $in: validIds }, ownerId });
    return result.deletedCount ?? 0;
  }

  async recordPlay(ownerId: string, slug: string): Promise<void> {
    await playlists().updateOne({ ownerId, slug }, { $inc: { plays: 1 } });
  }

  async recordLike(ownerId: string, slug: string): Promise<void> {
    await playlists().updateOne({ ownerId, slug }, { $inc: { likes: 1 } });
  }

  async recordSongPlays(ownerId: string, slug: string, songId: string, op: "plays" | "skips"): Promise<void> {
    const field = `songs.$[song].${op}`;
    await playlists().updateOne(
      { ownerId, slug, "songs.id": songId },
      { $inc: { [field]: 1 } },
      { arrayFilters: [{ "song.id": songId }] },
    );
  }

  async findFirstOwnerId(): Promise<string | null> {
    const doc = await playlists().findOne({}, { projection: { ownerId: 1 } });
    return doc?.ownerId ?? null;
  }
}