import { describe, expect, it } from "vitest";

import { createQuestionsStore } from "./questions-store";

describe("questions store", () => {
  it("starts with no answers", () => {
    const store = createQuestionsStore();
    expect(store.getState().answers).toEqual({});
  });

  it("records one answer per question", () => {
    const store = createQuestionsStore();
    store.getState().setAnswer("q_loves_more", "opt_both");
    store.getState().setAnswer("q_cuter", "opt_you");

    expect(store.getState().answers).toEqual({
      q_loves_more: "opt_both",
      q_cuter: "opt_you",
    });
  });

  it("overwrites the answer for an already answered question", () => {
    const store = createQuestionsStore();
    store.getState().setAnswer("q_cuter", "opt_me");
    store.getState().setAnswer("q_cuter", "opt_you");

    expect(store.getState().answers.q_cuter).toBe("opt_you");
  });

  it("resets all answers", () => {
    const store = createQuestionsStore();
    store.getState().setAnswer("q_loves_more", "opt_both");
    store.getState().reset();

    expect(store.getState().answers).toEqual({});
  });
});
