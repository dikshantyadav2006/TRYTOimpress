import { describe, expect, it } from "vitest";

import { createProposalSchema } from "./proposal.schemas";

describe("createProposalSchema", () => {
  it("accepts valid input", () => {
    const result = createProposalSchema.safeParse({
      title: "Will you be my valentine?",
      message: "I would love to spend that evening with you.",
      toName: "Sam",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a title that is too short", () => {
    const result = createProposalSchema.safeParse({
      title: "Hi",
      message: "I would love to spend that evening with you.",
      toName: "Sam",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing recipient", () => {
    const result = createProposalSchema.safeParse({
      title: "Will you be my valentine?",
      message: "I would love to spend that evening with you.",
    });
    expect(result.success).toBe(false);
  });
});
