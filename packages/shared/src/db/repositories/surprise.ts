import { ObjectId, type UpdateFilter } from "mongodb";

import type { Surprise } from "../../types/surprise";
import { surprises, type SurpriseDoc } from "../models";
import { mapSurprise } from "../mappers";

export interface SurpriseInput {
  emoji?: string;
  title: string;
  message: string;
  order?: number;
}

export class MongoSurpriseRepository {
  async getSurprises(ownerId: string): Promise<Surprise[]> {
    const docs = await surprises().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapSurprise(doc));
  }

  async createSurprise(input: SurpriseInput, ownerId: string): Promise<Surprise> {
    const count = await surprises().countDocuments({ ownerId });
    const doc: SurpriseDoc = {
      _id: new ObjectId(),
      ownerId,
      emoji: input.emoji ?? "🎁",
      title: input.title,
      message: input.message,
      order: input.order ?? count,
      createdAt: new Date(),
    };
    await surprises().insertOne(doc);
    return mapSurprise(doc);
  }

  async updateSurprise(ownerId: string, id: string, input: Partial<SurpriseInput>): Promise<Surprise | null> {
    const patch: UpdateFilter<SurpriseDoc> = { $set: {} };
    for (const key of ["emoji", "title", "message", "order"] as const) {
      if (input[key] !== undefined) {
        (patch.$set as Record<string, unknown>)[key] = input[key];
      }
    }
    const doc = await surprises().findOneAndUpdate({ _id: new ObjectId(id), ownerId }, patch, {
      returnDocument: "after",
    });
    return doc ? mapSurprise(doc) : null;
  }

  async deleteSurprise(ownerId: string, id: string): Promise<boolean> {
    const result = await surprises().deleteOne({ _id: new ObjectId(id), ownerId });
    return result.deletedCount > 0;
  }
}
