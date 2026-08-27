import type { AcceptProposalInput, CreateProposalInput } from "../types/api";
import type { Proposal, ProposalId } from "../types/proposal";
import type { ProposalResponse } from "../types/response";
import { mockProposals, mockResponses } from "../data/mock";
import { generateId } from "../utils/id";
import { toIso } from "../utils/time";
import { slugify } from "../utils/text";

export interface ProposalRepository {
  findById(ownerId: string, id: ProposalId): Promise<Proposal | null>;
  findBySlug(ownerId: string, slug: string): Promise<Proposal | null>;
  create(input: CreateProposalInput, userId: string, ownerId: string): Promise<Proposal>;
  saveResponse(
    ownerId: string,
    proposalId: ProposalId,
    input: AcceptProposalInput,
    answer: ProposalResponse["answer"],
  ): Promise<ProposalResponse>;
}

export class MockProposalRepository implements ProposalRepository {
  private readonly proposals: Proposal[] = [...mockProposals];
  private readonly responses: ProposalResponse[] = [...mockResponses];

  async findById(ownerId: string, id: ProposalId): Promise<Proposal | null> {
    return this.proposals.find((proposal) => proposal.id === id) ?? null;
  }

  async findBySlug(ownerId: string, slug: string): Promise<Proposal | null> {
    return this.proposals.find((proposal) => proposal.slug === slug) ?? null;
  }

  async create(input: CreateProposalInput, userId: string, _ownerId: string): Promise<Proposal> {
    const now = toIso();
    const proposal: Proposal = {
      id: generateId("prp"),
      slug: slugify(input.title) || `proposal-${Date.now()}`,
      title: input.title,
      subtitle: input.subtitle ?? "",
      message: input.message,
      imageUrl: input.imageUrl ?? "",
      ...(input.recipientName ? { recipientName: input.recipientName } : {}),
      locale: input.locale ?? "en",
      status: "published",
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };
    this.proposals.push(proposal);
    return proposal;
  }

  async saveResponse(
    ownerId: string,
    proposalId: ProposalId,
    input: AcceptProposalInput,
    answer: ProposalResponse["answer"],
  ): Promise<ProposalResponse> {
    const response: ProposalResponse = {
      id: generateId("rsp"),
      proposalId,
      answer,
      ...(input.responderName ? { responderName: input.responderName } : {}),
      respondedAt: toIso(),
    };
    this.responses.push(response);
    return response;
  }
}
