import type { ProposalId } from "./proposal";

export type ProposalAnswer = "accepted" | "declined" | "pending";

export interface ProposalResponse {
  id: string;
  proposalId: ProposalId;
  answer: ProposalAnswer;
  responderName?: string;
  respondedAt: string;
}
