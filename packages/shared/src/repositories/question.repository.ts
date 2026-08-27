import type { SubmitAnswerInput } from "../types/api";
import type { Answer, Question, QuestionId } from "../types/question";
import { mockAnswers, mockQuestions } from "../data/mock";
import { generateId } from "../utils/id";
import { toIso } from "../utils/time";

export interface QuestionRepository {
  getQuestions(ownerId: string): Promise<Question[]>;
  getQuestion(ownerId: string, id: QuestionId): Promise<Question | null>;
  submitAnswer(input: SubmitAnswerInput, ownerId: string): Promise<Answer>;
  getAnswers(ownerId: string): Promise<Answer[]>;
}

export class MockQuestionRepository implements QuestionRepository {
  private readonly questions: Question[] = [...mockQuestions];
  private readonly answers: Answer[] = [...mockAnswers];

  async getQuestions(_ownerId: string): Promise<Question[]> {
    return [...this.questions].sort((a, b) => a.order - b.order);
  }

  async getQuestion(_ownerId: string, id: QuestionId): Promise<Question | null> {
    return this.questions.find((question) => question.id === id) ?? null;
  }

  async submitAnswer(input: SubmitAnswerInput, _ownerId: string): Promise<Answer> {
    const answer: Answer = {
      id: generateId("ans"),
      questionId: input.questionId,
      optionId: input.optionId,
      answeredAt: toIso(),
    };
    this.answers.push(answer);
    return answer;
  }

  async getAnswers(_ownerId: string): Promise<Answer[]> {
    return [...this.answers];
  }
}
