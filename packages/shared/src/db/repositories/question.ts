import { ObjectId, type UpdateFilter } from "mongodb";

import type { QuestionRepository } from "../../repositories/question.repository";
import type { Answer, Question, QuestionOption } from "../../types/question";
import { answers, questions, type AnswerDoc, type QuestionDoc } from "../models";
import { mapAnswer, mapQuestion } from "../mappers";

export interface QuestionInput {
  title: string;
  subtitle: string;
  emoji?: string;
  options?: QuestionOption[];
  order?: number;
  correctAnswerId?: string;
  imageId?: string;
  imageUrl?: string;
}

export interface AnswerInput {
  questionId: string;
  optionId: string;
}

export class MongoQuestionRepository implements QuestionRepository {
  async getQuestions(ownerId: string): Promise<Question[]> {
    const docs = await questions().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapQuestion(doc));
  }

  async getQuestion(ownerId: string, id: string): Promise<Question | null> {
    const doc = await questions().findOne({ _id: new ObjectId(id), ownerId });
    return doc ? mapQuestion(doc) : null;
  }

  async createQuestion(input: QuestionInput, ownerId: string): Promise<Question> {
    const count = await questions().countDocuments({ ownerId });
    const doc: QuestionDoc = {
      _id: new ObjectId(),
      ownerId,
      title: input.title,
      subtitle: input.subtitle,
      emoji: input.emoji ?? "❓",
      options: input.options ?? [],
      order: input.order ?? count,
      createdAt: new Date(),
      ...(input.correctAnswerId ? { correctAnswerId: input.correctAnswerId } : {}),
      ...(input.imageId ? { imageId: input.imageId } : {}),
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
    };
    await questions().insertOne(doc);
    return mapQuestion(doc);
  }

  async updateQuestion(ownerId: string, id: string, input: Partial<QuestionInput>): Promise<Question | null> {
    const patch: UpdateFilter<QuestionDoc> = { $set: {} };
    for (const key of [
      "title",
      "subtitle",
      "emoji",
      "options",
      "order",
      "correctAnswerId",
      "imageId",
      "imageUrl",
    ] as const) {
      if (input[key] !== undefined) {
        (patch.$set as Record<string, unknown>)[key] = input[key];
      }
    }
    const doc = await questions().findOneAndUpdate({ _id: new ObjectId(id), ownerId }, patch, {
      returnDocument: "after",
    });
    return doc ? mapQuestion(doc) : null;
  }

  async deleteQuestion(ownerId: string, id: string): Promise<boolean> {
    const result = await questions().deleteOne({ _id: new ObjectId(id), ownerId });
    return result.deletedCount > 0;
  }

  async submitAnswer(input: AnswerInput, ownerId: string): Promise<Answer> {
    const doc: AnswerDoc = {
      _id: new ObjectId(),
      ownerId,
      questionId: input.questionId,
      optionId: input.optionId,
      answeredAt: new Date(),
    };
    await answers().insertOne(doc);
    return mapAnswer(doc);
  }

  async getAnswers(ownerId: string): Promise<Answer[]> {
    const docs = await answers().find({ ownerId }).sort({ answeredAt: -1 }).toArray();
    return docs.map((doc) => mapAnswer(doc));
  }

  async deleteAnswers(ownerId: string, questionId?: string): Promise<number> {
    const filter: Record<string, unknown> = { ownerId };
    if (questionId) filter.questionId = questionId;
    const result = await answers().deleteMany(filter);
    return result.deletedCount;
  }
}
