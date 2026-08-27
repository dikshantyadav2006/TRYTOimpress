import type { AcceptProposalInput, CreateProposalInput } from "../types/api";
import type { AnalyticsEvent, AnalyticsEventName } from "../types/analytics";
import type { Proposal, ProposalId } from "../types/proposal";
import type { ProposalResponse } from "../types/response";
import type { ProposalRepository } from "../repositories/proposal.repository";
import { MockProposalRepository } from "../repositories/proposal.repository";
import { toIso } from "../utils/time";

export interface ProposalService {
  getProposal(ownerId: string, idOrSlug: string): Promise<Proposal | null>;
  acceptProposal(ownerId: string, proposalId: ProposalId, input?: AcceptProposalInput): Promise<ProposalResponse>;
  declineProposal(ownerId: string, proposalId: ProposalId, input?: AcceptProposalInput): Promise<ProposalResponse>;
  createProposal(ownerId: string, input: CreateProposalInput): Promise<Proposal>;
  trackEvent(name: AnalyticsEventName, proposalId: ProposalId): Promise<void>;
}

export class ProposalServiceImplementation implements ProposalService {
  constructor(private readonly repository: ProposalRepository) {}

  async getProposal(ownerId: string, idOrSlug: string): Promise<Proposal | null> {
    const proposal = await this.repository.findById(ownerId, idOrSlug);
    if (proposal) return proposal;
    return this.repository.findBySlug(ownerId, idOrSlug);
  }

  async acceptProposal(
    ownerId: string,
    proposalId: ProposalId,
    input: AcceptProposalInput = {},
  ): Promise<ProposalResponse> {
    return this.repository.saveResponse(ownerId, proposalId, input, "accepted");
  }

  async declineProposal(
    ownerId: string,
    proposalId: ProposalId,
    input: AcceptProposalInput = {},
  ): Promise<ProposalResponse> {
    return this.repository.saveResponse(ownerId, proposalId, input, "declined");
  }

  async createProposal(ownerId: string, input: CreateProposalInput): Promise<Proposal> {
    return this.repository.create(input, ownerId, ownerId);
  }

  async trackEvent(name: AnalyticsEventName, proposalId: ProposalId): Promise<void> {
    const event: AnalyticsEvent = {
      name,
      proposalId,
      timestamp: toIso(),
    };
    await Promise.resolve(event);
  }
}

export function createProposalService(
  repository: ProposalRepository = new MockProposalRepository(),
): ProposalService {
  return new ProposalServiceImplementation(repository);
}
