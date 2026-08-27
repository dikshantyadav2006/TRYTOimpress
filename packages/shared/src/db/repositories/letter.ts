import { ObjectId, type UpdateFilter } from "mongodb";

import type { Letter } from "../../types/letter";
import { letters, type LetterDoc } from "../models";
import { mapLetter } from "../mappers";

export interface LetterInput {
  emoji?: string;
  title: string;
  message: string;
  order?: number;
}

export class MongoLetterRepository {
  async getLetters(ownerId: string): Promise<Letter[]> {
    const docs = await letters().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapLetter(doc));
  }

  async createLetter(input: LetterInput, ownerId: string): Promise<Letter> {
    const count = await letters().countDocuments({ ownerId });
    const doc: LetterDoc = {
      _id: new ObjectId(),
      ownerId,
      emoji: input.emoji ?? "💌",
      title: input.title,
      message: input.message,
      order: input.order ?? count,
      createdAt: new Date(),
    };
    await letters().insertOne(doc);
    return mapLetter(doc);
  }

  async updateLetter(ownerId: string, id: string, input: Partial<LetterInput>): Promise<Letter | null> {
    const patch: UpdateFilter<LetterDoc> = { $set: {} };
    for (const key of ["emoji", "title", "message", "order"] as const) {
      if (input[key] !== undefined) {
        (patch.$set as Record<string, unknown>)[key] = input[key];
      }
    }
    const doc = await letters().findOneAndUpdate({ _id: new ObjectId(id), ownerId }, patch, {
      returnDocument: "after",
    });
    return doc ? mapLetter(doc) : null;
  }

  async deleteLetter(ownerId: string, id: string): Promise<boolean> {
    const result = await letters().deleteOne({ _id: new ObjectId(id), ownerId });
    return result.deletedCount > 0;
  }
}
