import { ObjectId, type UpdateFilter } from "mongodb";

import type { Wish } from "../../types/wish";
import { wishes, type WishDoc } from "../models";
import { mapWish } from "../mappers";

export interface WishInput {
  emoji?: string;
  text: string;
  order?: number;
}

export class MongoWishRepository {
  async getWishes(ownerId: string): Promise<Wish[]> {
    const docs = await wishes().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapWish(doc));
  }

  async createWish(input: WishInput, ownerId: string): Promise<Wish> {
    const count = await wishes().countDocuments({ ownerId });
    const doc: WishDoc = {
      _id: new ObjectId(),
      ownerId,
      emoji: input.emoji ?? "🌠",
      text: input.text,
      order: input.order ?? count,
      createdAt: new Date(),
    };
    await wishes().insertOne(doc);
    return mapWish(doc);
  }

  async updateWish(ownerId: string, id: string, input: Partial<WishInput>): Promise<Wish | null> {
    const patch: UpdateFilter<WishDoc> = { $set: {} };
    for (const key of ["emoji", "text", "order"] as const) {
      if (input[key] !== undefined) {
        (patch.$set as Record<string, unknown>)[key] = input[key];
      }
    }
    const doc = await wishes().findOneAndUpdate({ _id: new ObjectId(id), ownerId }, patch, {
      returnDocument: "after",
    });
    return doc ? mapWish(doc) : null;
  }

  async deleteWish(ownerId: string, id: string): Promise<boolean> {
    const result = await wishes().deleteOne({ _id: new ObjectId(id), ownerId });
    return result.deletedCount > 0;
  }
}
