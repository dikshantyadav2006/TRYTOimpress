import type { GalleryImage } from "./gallery";
import type { Memory } from "./memory";
import type { Proposal } from "./proposal";
import type { Answer, Question } from "./question";
import type { ProposalResponse } from "./response";

export interface CreateProposalInput {
  title: string;
  message: string;
  subtitle?: string;
  imageUrl?: string;
  recipientName?: string;
  locale?: string;
}

export interface AcceptProposalInput {
  responderName?: string;
}

export interface SubmitAnswerInput {
  questionId: string;
  optionId: string;
}

export interface ProposalApiResponse {
  data: Proposal;
}

export interface ProposalResponseApi {
  data: ProposalResponse;
}

export interface QuestionsApiResponse {
  data: Question[];
}

export interface AnswersApiResponse {
  data: Answer[];
}

export interface MemoriesApiResponse {
  data: Memory[];
}

export interface GalleryApiResponse {
  data: GalleryImage[];
}
