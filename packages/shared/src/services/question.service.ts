import type { SubmitAnswerInput } from "../types/api";
import type { Answer, Question, QuestionId } from "../types/question";
import type { QuestionRepository } from "../repositories/question.repository";
import { MockQuestionRepository } from "../repositories/question.repository";

export interface QuestionService {
  getQuestions(ownerId: string): Promise<Question[]>;
  getQuestion(ownerId: string, id: QuestionId): Promise<Question | null>;
  submitAnswer(input: SubmitAnswerInput, ownerId: string): Promise<Answer>;
  getAnswers(ownerId: string): Promise<Answer[]>;
}

export class QuestionServiceImplementation implements QuestionService {
  constructor(private readonly repository: QuestionRepository) {}

  async getQuestions(ownerId: string): Promise<Question[]> {
    return this.repository.getQuestions(ownerId);
  }

  async getQuestion(ownerId: string, id: QuestionId): Promise<Question | null> {
    return this.repository.getQuestion(ownerId, id);
  }

  async submitAnswer(input: SubmitAnswerInput, ownerId: string): Promise<Answer> {
    return this.repository.submitAnswer(input, ownerId);
  }

  async getAnswers(ownerId: string): Promise<Answer[]> {
    return this.repository.getAnswers(ownerId);
  }
}

export function createQuestionService(
  repository: QuestionRepository = new MockQuestionRepository(),
): QuestionService {
  return new QuestionServiceImplementation(repository);
}
