import { describe, expect, it } from "vitest";

import { createQuestionService } from "./question.service";
import { MockQuestionRepository } from "../repositories/question.repository";

describe("question service", () => {
  const service = createQuestionService();
  const ownerId = "owner_1";

  it("returns questions sorted by order", async () => {
    const questions = await service.getQuestions(ownerId);
    expect(questions.length).toBeGreaterThan(0);
    const orders = questions.map((question) => question.order);
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
  });

  it("returns a question by id", async () => {
    const question = await service.getQuestion(ownerId, "q_loves_more");
    expect(question?.title).toBe("Who loves more?");
    expect(question?.options.length).toBeGreaterThanOrEqual(3);
  });

  it("returns null for an unknown question", async () => {
    expect(await service.getQuestion(ownerId, "does_not_exist")).toBeNull();
  });

  it("records an answer", async () => {
    const answer = await service.submitAnswer(
      {
        questionId: "q_loves_more",
        optionId: "opt_both",
      },
      ownerId,
    );
    expect(answer.questionId).toBe("q_loves_more");
    expect(answer.optionId).toBe("opt_both");
    expect(answer.answeredAt).toBeTruthy();
  });

  it("records answers in the repository", async () => {
    const repository = new MockQuestionRepository();
    const svc = createQuestionService(repository);
    await svc.submitAnswer({ questionId: "q_cuter", optionId: "opt_you" }, ownerId);
    const answers = await svc.getAnswers(ownerId);
    expect(answers).toHaveLength(1);
    expect(answers[0]?.questionId).toBe("q_cuter");
  });
});
