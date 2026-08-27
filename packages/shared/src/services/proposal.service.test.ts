import { describe, expect, it } from "vitest";

import { createProposalService } from "./proposal.service";
import { MockProposalRepository } from "../repositories/proposal.repository";

describe("proposal service", () => {
  const service = createProposalService(new MockProposalRepository());
  const ownerId = "owner_1";

  it("resolves the seeded proposal by slug", async () => {
    const proposal = await service.getProposal(ownerId, "will-you-be-my-girlfriend");
    expect(proposal).not.toBeNull();
    expect(proposal?.title).toContain("girlfriend");
  });

  it("creates a proposal and retrieves it by id", async () => {
    const created = await service.createProposal(ownerId, {
      title: "Dinner on Friday?",
      message: "Would you join me for dinner this Friday?",
    });
    const found = await service.getProposal(ownerId, created.id);
    expect(found?.id).toBe(created.id);
    expect(found?.slug).toBe("dinner-on-friday");
  });

  it("records an accepted response", async () => {
    const created = await service.createProposal(ownerId, {
      title: "Dinner on Friday?",
      message: "Would you join me for dinner this Friday?",
    });
    const response = await service.acceptProposal(ownerId, created.id, { responderName: "Sam" });
    expect(response.answer).toBe("accepted");
    expect(response.proposalId).toBe(created.id);
    expect(response.responderName).toBe("Sam");
  });

  it("returns null for an unknown proposal", async () => {
    const proposal = await service.getProposal(ownerId, "does-not-exist");
    expect(proposal).toBeNull();
  });
});
