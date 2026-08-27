import { ObjectId, type UpdateFilter } from "mongodb";

import type { Compliment } from "../../types/compliment";
import { compliments, type ComplimentDoc } from "../models";
import { mapCompliment } from "../mappers";

export interface ComplimentInput {
  emoji?: string;
  text: string;
  order?: number;
}

export class MongoComplimentRepository {
  async getCompliments(ownerId: string): Promise<Compliment[]> {
    const docs = await compliments().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapCompliment(doc));
  }

  async createCompliment(input: ComplimentInput, ownerId: string): Promise<Compliment> {
    const count = await compliments().countDocuments({ ownerId });
    const doc: ComplimentDoc = {
      _id: new ObjectId(),
      ownerId,
      emoji: input.emoji ?? "💖",
      text: input.text,
      order: input.order ?? count,
      createdAt: new Date(),
    };
    await compliments().insertOne(doc);
    return mapCompliment(doc);
  }

  async updateCompliment(ownerId: string, id: string, input: Partial<ComplimentInput>): Promise<Compliment | null> {
    const patch: UpdateFilter<ComplimentDoc> = { $set: {} };
    for (const key of ["emoji", "text", "order"] as const) {
      if (input[key] !== undefined) {
        (patch.$set as Record<string, unknown>)[key] = input[key];
      }
    }
    const doc = await compliments().findOneAndUpdate({ _id: new ObjectId(id), ownerId }, patch, {
      returnDocument: "after",
    });
    return doc ? mapCompliment(doc) : null;
  }

  async deleteCompliment(ownerId: string, id: string): Promise<boolean> {
    const result = await compliments().deleteOne({ _id: new ObjectId(id), ownerId });
    return result.deletedCount > 0;
  }
}
