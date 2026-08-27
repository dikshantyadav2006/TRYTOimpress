import { describe, expect, it } from "vitest";

import { submitAnswerSchema } from "./answer.schemas";

describe("submitAnswerSchema", () => {
  it("accepts a valid answer payload", () => {
    const result = submitAnswerSchema.safeParse({
      questionId: "q_cuter",
      optionId: "opt_you",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a payload without a question id", () => {
    const result = submitAnswerSchema.safeParse({ optionId: "opt_you" });
    expect(result.success).toBe(false);
  });

  it("rejects a payload without an option id", () => {
    const result = submitAnswerSchema.safeParse({ questionId: "q_cuter" });
    expect(result.success).toBe(false);
  });
});
