import { ObjectId, type UpdateFilter } from "mongodb";

import type { LoveNote } from "../../types/note";
import { loveNotes, type LoveNoteDoc } from "../models";
import { mapLoveNote } from "../mappers";

export interface LoveNoteInput {
  emoji?: string;
  text: string;
  order?: number;
}

export class MongoLoveNoteRepository {
  async getLoveNotes(ownerId: string): Promise<LoveNote[]> {
    const docs = await loveNotes().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapLoveNote(doc));
  }

  async createLoveNote(input: LoveNoteInput, ownerId: string): Promise<LoveNote> {
    const count = await loveNotes().countDocuments({ ownerId });
    const doc: LoveNoteDoc = {
      _id: new ObjectId(),
      ownerId,
      emoji: input.emoji ?? "💌",
      text: input.text,
      order: input.order ?? count,
      createdAt: new Date(),
    };
    await loveNotes().insertOne(doc);
    return mapLoveNote(doc);
  }

  async updateLoveNote(ownerId: string, id: string, input: Partial<LoveNoteInput>): Promise<LoveNote | null> {
    const patch: UpdateFilter<LoveNoteDoc> = { $set: {} };
    for (const key of ["emoji", "text", "order"] as const) {
      if (input[key] !== undefined) {
        (patch.$set as Record<string, unknown>)[key] = input[key];
      }
    }
    const doc = await loveNotes().findOneAndUpdate({ _id: new ObjectId(id), ownerId }, patch, {
      returnDocument: "after",
    });
    return doc ? mapLoveNote(doc) : null;
  }

  async deleteLoveNote(ownerId: string, id: string): Promise<boolean> {
    const result = await loveNotes().deleteOne({ _id: new ObjectId(id), ownerId });
    return result.deletedCount > 0;
  }
}
