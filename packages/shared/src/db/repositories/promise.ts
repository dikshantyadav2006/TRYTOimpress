import { ObjectId, type UpdateFilter } from "mongodb";

import type { LovePromise } from "../../types/promise";
import { lovePromises, type LovePromiseDoc } from "../models";
import { mapLovePromise } from "../mappers";

export interface LovePromiseInput {
  emoji?: string;
  title: string;
  text: string;
  order?: number;
}

export class MongoLovePromiseRepository {
  async getLovePromises(ownerId: string): Promise<LovePromise[]> {
    const docs = await lovePromises().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapLovePromise(doc));
  }

  async createLovePromise(input: LovePromiseInput, ownerId: string): Promise<LovePromise> {
    const count = await lovePromises().countDocuments({ ownerId });
    const doc: LovePromiseDoc = {
      _id: new ObjectId(),
      ownerId,
      emoji: input.emoji ?? "🤍",
      title: input.title,
      text: input.text,
      order: input.order ?? count,
      createdAt: new Date(),
    };
    await lovePromises().insertOne(doc);
    return mapLovePromise(doc);
  }

  async updateLovePromise(
    ownerId: string,
    id: string,
    input: Partial<LovePromiseInput>,
  ): Promise<LovePromise | null> {
    const patch: UpdateFilter<LovePromiseDoc> = { $set: {} };
    for (const key of ["emoji", "title", "text", "order"] as const) {
      if (input[key] !== undefined) {
        (patch.$set as Record<string, unknown>)[key] = input[key];
      }
    }
    const doc = await lovePromises().findOneAndUpdate({ _id: new ObjectId(id), ownerId }, patch, {
      returnDocument: "after",
    });
    return doc ? mapLovePromise(doc) : null;
  }

  async deleteLovePromise(ownerId: string, id: string): Promise<boolean> {
    const result = await lovePromises().deleteOne({ _id: new ObjectId(id), ownerId });
    return result.deletedCount > 0;
  }
}
