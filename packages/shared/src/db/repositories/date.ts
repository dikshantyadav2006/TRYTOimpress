import { ObjectId, type UpdateFilter } from "mongodb";

import type { DateIdea } from "../../types/date";
import { dateIdeas, type DateIdeaDoc } from "../models";
import { mapDateIdea } from "../mappers";

export interface DateIdeaInput {
  emoji?: string;
  title: string;
  description: string;
  tag?: string;
  order?: number;
}

export class MongoDateIdeaRepository {
  async getDateIdeas(ownerId: string): Promise<DateIdea[]> {
    const docs = await dateIdeas().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapDateIdea(doc));
  }

  async createDateIdea(input: DateIdeaInput, ownerId: string): Promise<DateIdea> {
    const count = await dateIdeas().countDocuments({ ownerId });
    const doc: DateIdeaDoc = {
      _id: new ObjectId(),
      ownerId,
      emoji: input.emoji ?? "🌹",
      title: input.title,
      description: input.description,
      tag: input.tag ?? "sweet",
      order: input.order ?? count,
      createdAt: new Date(),
    };
    await dateIdeas().insertOne(doc);
    return mapDateIdea(doc);
  }

  async updateDateIdea(ownerId: string, id: string, input: Partial<DateIdeaInput>): Promise<DateIdea | null> {
    const patch: UpdateFilter<DateIdeaDoc> = { $set: {} };
    for (const key of ["emoji", "title", "description", "tag", "order"] as const) {
      if (input[key] !== undefined) {
        (patch.$set as Record<string, unknown>)[key] = input[key];
      }
    }
    const doc = await dateIdeas().findOneAndUpdate({ _id: new ObjectId(id), ownerId }, patch, {
      returnDocument: "after",
    });
    return doc ? mapDateIdea(doc) : null;
  }

  async deleteDateIdea(ownerId: string, id: string): Promise<boolean> {
    const result = await dateIdeas().deleteOne({ _id: new ObjectId(id), ownerId });
    return result.deletedCount > 0;
  }
}
