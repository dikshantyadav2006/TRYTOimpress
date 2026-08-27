import { ObjectId, type UpdateFilter } from "mongodb";

import type { Dream } from "../../types/dream";
import { dreams, type DreamDoc } from "../models";
import { mapDream } from "../mappers";

export interface DreamInput {
  emoji?: string;
  title: string;
  text: string;
  order?: number;
}

export class MongoDreamRepository {
  async getDreams(ownerId: string): Promise<Dream[]> {
    const docs = await dreams().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapDream(doc));
  }

  async createDream(input: DreamInput, ownerId: string): Promise<Dream> {
    const count = await dreams().countDocuments({ ownerId });
    const doc: DreamDoc = {
      _id: new ObjectId(),
      ownerId,
      emoji: input.emoji ?? "✨",
      title: input.title,
      text: input.text,
      order: input.order ?? count,
      createdAt: new Date(),
    };
    await dreams().insertOne(doc);
    return mapDream(doc);
  }

  async updateDream(ownerId: string, id: string, input: Partial<DreamInput>): Promise<Dream | null> {
    const patch: UpdateFilter<DreamDoc> = { $set: {} };
    for (const key of ["emoji", "title", "text", "order"] as const) {
      if (input[key] !== undefined) {
        (patch.$set as Record<string, unknown>)[key] = input[key];
      }
    }
    const doc = await dreams().findOneAndUpdate({ _id: new ObjectId(id), ownerId }, patch, {
      returnDocument: "after",
    });
    return doc ? mapDream(doc) : null;
  }

  async deleteDream(ownerId: string, id: string): Promise<boolean> {
    const result = await dreams().deleteOne({ _id: new ObjectId(id), ownerId });
    return result.deletedCount > 0;
  }
}
