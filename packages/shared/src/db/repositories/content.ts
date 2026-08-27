import { ObjectId, type Filter, type UpdateFilter } from "mongodb";

import type { ContentRepository } from "../../repositories/content.repository";
import type { GalleryCategory, GalleryImage } from "../../types/gallery";
import type { Memory } from "../../types/memory";
import { generateId } from "../../utils/id";
import { toIso } from "../../utils/time";
import { galleryImages, memories, type GalleryImageDoc, type MemoryDoc } from "../models";
import { mapGalleryImage, mapMemory } from "../mappers";

export interface MemoryInput {
  title: string;
  date: string;
  caption: string;
  imageId?: string;
  imageUrl?: string;
  order?: number;
}

export interface GalleryImageInput {
  caption: string;
  category?: GalleryCategory;
  featured?: boolean;
  order?: number;
  imageUrl?: string;
}

export interface GalleryFeed {
  items: GalleryImage[];
  total: number;
  hasMore: boolean;
}

function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

function toGalleryFilter(id: string): Filter<GalleryImageDoc> {
  return OBJECT_ID_PATTERN.test(id) ? { _id: new ObjectId(id) } : { registryId: id };
}

export class MongoContentRepository implements ContentRepository {
  async getMemories(ownerId: string): Promise<Memory[]> {
    const docs = await memories().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapMemory(doc));
  }

  async getGalleryImages(ownerId: string): Promise<GalleryImage[]> {
    const docs = await galleryImages().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapGalleryImage(doc));
  }

  async getGalleryFeed(ownerId: string, page: number, pageSize: number): Promise<GalleryFeed> {
    const skip = Math.max(0, (page - 1) * pageSize);
    const cursor = galleryImages().find({ ownerId }).sort({ order: 1, createdAt: 1 }).skip(skip).limit(pageSize);
    const [docs, total] = await Promise.all([
      cursor.toArray(),
      galleryImages().countDocuments({ ownerId }),
    ]);
    const items = docs.map((doc) => mapGalleryImage(doc));
    return { items, total, hasMore: skip + items.length < total };
  }

  async createMemory(input: MemoryInput, ownerId: string): Promise<Memory> {
    const count = await memories().countDocuments({ ownerId });
    const doc: MemoryDoc = {
      _id: new ObjectId(),
      ownerId,
      title: input.title,
      date: input.date,
      caption: input.caption,
      imageId: input.imageId ?? "",
      order: input.order ?? count,
      createdAt: new Date(),
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
    };
    await memories().insertOne(doc);
    return mapMemory(doc);
  }

  async updateMemory(ownerId: string, id: string, input: Partial<MemoryInput>): Promise<Memory | null> {
    const patch: UpdateFilter<MemoryDoc> = { $set: {} };
    for (const key of ["title", "date", "caption", "imageId", "imageUrl", "order"] as const) {
      if (input[key] !== undefined) {
        (patch.$set as Record<string, unknown>)[key] = input[key];
      }
    }
    const doc = await memories().findOneAndUpdate({ _id: toObjectId(id), ownerId }, patch, {
      returnDocument: "after",
    });
    return doc ? mapMemory(doc) : null;
  }

  async deleteMemory(ownerId: string, id: string): Promise<boolean> {
    const result = await memories().deleteOne({ _id: toObjectId(id), ownerId });
    return result.deletedCount > 0;
  }

  async createGalleryImage(input: GalleryImageInput, ownerId: string): Promise<GalleryImage> {
    const count = await galleryImages().countDocuments({ ownerId });
    const doc: GalleryImageDoc = {
      _id: new ObjectId(),
      ownerId,
      caption: input.caption,
      category: input.category ?? "moment",
      featured: input.featured ?? false,
      order: input.order ?? count,
      createdAt: new Date(),
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
    };
    await galleryImages().insertOne(doc);
    return mapGalleryImage(doc);
  }

  async updateGalleryImage(ownerId: string, id: string, input: Partial<GalleryImageInput>): Promise<GalleryImage | null> {
    const patch: UpdateFilter<GalleryImageDoc> = { $set: {} };
    for (const key of ["caption", "category", "featured", "order", "imageUrl"] as const) {
      if (input[key] !== undefined) {
        (patch.$set as Record<string, unknown>)[key] = input[key];
      }
    }
    const filter = toGalleryFilter(id);
    filter.ownerId = ownerId;
    const doc = await galleryImages().findOneAndUpdate(filter, patch, {
      returnDocument: "after",
    });
    return doc ? mapGalleryImage(doc) : null;
  }

  async deleteGalleryImage(ownerId: string, id: string): Promise<boolean> {
    const filter = toGalleryFilter(id);
    filter.ownerId = ownerId;
    const result = await galleryImages().deleteOne(filter);
    return result.deletedCount > 0;
  }

  async createFallbackMemory(input: MemoryInput): Promise<Memory> {
    return {
      id: generateId("mem"),
      title: input.title,
      date: input.date,
      caption: input.caption,
      imageId: input.imageId ?? "",
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      createdAt: toIso(),
    };
  }

  async createFallbackGalleryImage(input: GalleryImageInput): Promise<GalleryImage> {
    return {
      id: generateId("gal"),
      caption: input.caption,
      category: input.category ?? "moment",
      featured: input.featured ?? false,
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      createdAt: toIso(),
    };
  }
}

export type MemoryFilter = Filter<MemoryDoc>;
