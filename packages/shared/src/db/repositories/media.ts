import { ObjectId } from "mongodb";

import type { Media, MediaResourceType } from "../../types/media";
import { media, type MediaDoc } from "../models";
import { mapMedia } from "../mappers";

export interface MediaInput {
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
  resourceType: MediaResourceType;
  publicId?: string;
  width?: number;
  height?: number;
  duration?: number;
  fingerprint?: string;
}

export interface MediaDuplicateCheck {
  originalName: string;
  size: number;
  mimetype: string;
  fingerprint: string;
}

export class MongoMediaRepository {
  constructor() {
    void media()
      .createIndex({ size: 1, originalName: 1, mimetype: 1 })
      .catch(() => {
        // Index creation is best-effort; a missing index only slows lookups.
      });
  }

  async findDuplicate(ownerId: string, input: MediaDuplicateCheck): Promise<Media | null> {
    const doc = await media().findOne({
      ownerId,
      originalName: input.originalName,
      size: input.size,
      mimetype: input.mimetype,
      fingerprint: input.fingerprint,
    });
    return doc ? mapMedia(doc) : null;
  }

  async create(input: MediaInput, ownerId: string): Promise<Media> {
    const doc: MediaDoc = {
      _id: new ObjectId(),
      ownerId,
      originalName: input.originalName,
      size: input.size,
      mimetype: input.mimetype,
      url: input.url,
      resourceType: input.resourceType,
      createdAt: new Date(),
      ...(input.publicId ? { publicId: input.publicId } : {}),
      ...(input.width !== undefined ? { width: input.width } : {}),
      ...(input.height !== undefined ? { height: input.height } : {}),
      ...(input.duration !== undefined ? { duration: input.duration } : {}),
      ...(input.fingerprint ? { fingerprint: input.fingerprint } : {}),
    };
    await media().insertOne(doc);
    return mapMedia(doc);
  }
}
