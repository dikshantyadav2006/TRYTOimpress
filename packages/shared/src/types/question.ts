export type QuestionId = string;

export interface QuestionOption {
  id: string;
  label: string;
  emoji: string;
}

export interface Question {
  id: QuestionId;
  title: string;
  subtitle: string;
  emoji: string;
  options: QuestionOption[];
  order: number;
  correctAnswerId?: string;
  imageId?: string;
  imageUrl?: string;
}

export interface Answer {
  id: string;
  questionId: QuestionId;
  optionId: string;
  answeredAt: string;
}
