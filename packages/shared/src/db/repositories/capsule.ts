import { ObjectId, type UpdateFilter } from "mongodb";

import type { Capsule } from "../../types/capsule";
import { capsules, type CapsuleDoc } from "../models";
import { mapCapsule } from "../mappers";

export interface CapsuleInput {
  emoji?: string;
  title: string;
  message: string;
  unlockDate?: string;
  order?: number;
}

export class MongoCapsuleRepository {
  async getCapsules(ownerId: string): Promise<Capsule[]> {
    const docs = await capsules().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapCapsule(doc));
  }

  async createCapsule(input: CapsuleInput, ownerId: string): Promise<Capsule> {
    const count = await capsules().countDocuments({ ownerId });
    const doc: CapsuleDoc = {
      _id: new ObjectId(),
      ownerId,
      emoji: input.emoji ?? "⏳",
      title: input.title,
      message: input.message,
      unlockDate: input.unlockDate ?? "2099-12-31",
      order: input.order ?? count,
      createdAt: new Date(),
    };
    await capsules().insertOne(doc);
    return mapCapsule(doc);
  }

  async updateCapsule(ownerId: string, id: string, input: Partial<CapsuleInput>): Promise<Capsule | null> {
    const patch: UpdateFilter<CapsuleDoc> = { $set: {} };
    for (const key of ["emoji", "title", "message", "unlockDate", "order"] as const) {
      if (input[key] !== undefined) {
        (patch.$set as Record<string, unknown>)[key] = input[key];
      }
    }
    const doc = await capsules().findOneAndUpdate({ _id: new ObjectId(id), ownerId }, patch, {
      returnDocument: "after",
    });
    return doc ? mapCapsule(doc) : null;
  }

  async deleteCapsule(ownerId: string, id: string): Promise<boolean> {
    const result = await capsules().deleteOne({ _id: new ObjectId(id), ownerId });
    return result.deletedCount > 0;
  }
}
