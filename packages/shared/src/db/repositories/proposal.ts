import { ObjectId } from "mongodb";

import type { AcceptProposalInput, CreateProposalInput } from "../../types/api";
import type { Proposal, ProposalId } from "../../types/proposal";
import type { ProposalResponse } from "../../types/response";
import type { ProposalRepository } from "../../repositories/proposal.repository";
import { slugify } from "../../utils/text";
import { proposals, proposalResponses, type ProposalDoc, type ProposalResponseDoc } from "../models";
import { mapProposal, mapProposalResponse } from "../mappers";

export class MongoProposalRepository implements ProposalRepository {
  async findById(ownerId: string, id: ProposalId): Promise<Proposal | null> {
    const doc = await proposals().findOne({ _id: new ObjectId(id), ownerId });
    return doc ? mapProposal(doc) : null;
  }

  async findBySlug(ownerId: string, slug: string): Promise<Proposal | null> {
    const doc = await proposals().findOne({ slug, ownerId });
    return doc ? mapProposal(doc) : null;
  }

  async create(input: CreateProposalInput, userId: string, ownerId: string): Promise<Proposal> {
    const now = new Date();
    const doc: ProposalDoc = {
      _id: new ObjectId(),
      ownerId,
      slug: slugify(input.title) || `proposal-${Date.now()}`,
      title: input.title,
      message: input.message,
      subtitle: input.subtitle ?? "",
      imageUrl: input.imageUrl ?? "",
      locale: input.locale ?? "en",
      status: "published",
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      ...(input.recipientName ? { recipientName: input.recipientName } : {}),
    };
    await proposals().insertOne(doc);
    return mapProposal(doc);
  }

  async saveResponse(
    ownerId: string,
    proposalId: ProposalId,
    input: AcceptProposalInput,
    answer: ProposalResponse["answer"],
  ): Promise<ProposalResponse> {
    const doc: ProposalResponseDoc = {
      _id: new ObjectId(),
      ownerId,
      proposalId,
      answer,
      respondedAt: new Date(),
      ...(input.responderName ? { responderName: input.responderName } : {}),
    };
    await proposalResponses().insertOne(doc);
    return mapProposalResponse(doc);
  }

  async getResponses(ownerId: string, proposalId?: ProposalId): Promise<ProposalResponse[]> {
    const filter: Record<string, unknown> = { ownerId };
    if (proposalId) filter.proposalId = proposalId;
    const docs = await proposalResponses().find(filter).sort({ respondedAt: -1 }).toArray();
    return docs.map((doc) => mapProposalResponse(doc));
  }

  async deleteResponses(ownerId: string, proposalId?: ProposalId): Promise<number> {
    const filter: Record<string, unknown> = { ownerId };
    if (proposalId) filter.proposalId = proposalId;
    const result = await proposalResponses().deleteMany(filter);
    return result.deletedCount;
  }

  async listProposals(ownerId: string): Promise<Proposal[]> {
    const docs = await proposals().find({ ownerId }).sort({ createdAt: -1 }).toArray();
    return docs.map((doc) => mapProposal(doc));
  }

  async deleteProposal(ownerId: string, id: string): Promise<boolean> {
    const result = await proposals().deleteOne({ _id: new ObjectId(id), ownerId });
    return result.deletedCount > 0;
  }
}
