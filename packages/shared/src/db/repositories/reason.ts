import { ObjectId, type UpdateFilter } from "mongodb";

import type { Reason } from "../../types/reason";
import { reasons, type ReasonDoc } from "../models";
import { mapReason } from "../mappers";

export interface ReasonInput {
  emoji?: string;
  title: string;
  detail: string;
  order?: number;
}

export class MongoReasonRepository {
  async getReasons(ownerId: string): Promise<Reason[]> {
    const docs = await reasons().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapReason(doc));
  }

  async createReason(input: ReasonInput, ownerId: string): Promise<Reason> {
    const count = await reasons().countDocuments({ ownerId });
    const doc: ReasonDoc = {
      _id: new ObjectId(),
      ownerId,
      emoji: input.emoji ?? "❤️",
      title: input.title,
      detail: input.detail,
      order: input.order ?? count,
      createdAt: new Date(),
    };
    await reasons().insertOne(doc);
    return mapReason(doc);
  }

  async updateReason(ownerId: string, id: string, input: Partial<ReasonInput>): Promise<Reason | null> {
    const patch: UpdateFilter<ReasonDoc> = { $set: {} };
    for (const key of ["emoji", "title", "detail", "order"] as const) {
      if (input[key] !== undefined) {
        (patch.$set as Record<string, unknown>)[key] = input[key];
      }
    }
    const doc = await reasons().findOneAndUpdate({ _id: new ObjectId(id), ownerId }, patch, {
      returnDocument: "after",
    });
    return doc ? mapReason(doc) : null;
  }

  async deleteReason(ownerId: string, id: string): Promise<boolean> {
    const result = await reasons().deleteOne({ _id: new ObjectId(id), ownerId });
    return result.deletedCount > 0;
  }
}
