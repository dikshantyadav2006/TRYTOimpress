import { describe, expect, it } from "vitest";

import { createProposalStore } from "./proposal-store";

describe("proposal store", () => {
  it("starts in the idle state", () => {
    const store = createProposalStore();
    const state = store.getState();

    expect(state.proposalAccepted).toBe(false);
    expect(state.animationState).toBe("idle");
    expect(state.noButtonPosition).toBeNull();
    expect(state.noButtonFleeCount).toBe(0);
  });

  it("accepts a proposal", () => {
    const store = createProposalStore();
    store.getState().accept();

    const state = store.getState();
    expect(state.proposalAccepted).toBe(true);
    expect(state.animationState).toBe("accepted");
  });

  it("moves the no button and increments the flee count", () => {
    const store = createProposalStore();
    store.getState().moveNoButton({ x: 120, y: 300 });

    const state = store.getState();
    expect(state.noButtonPosition).toEqual({ x: 120, y: 300 });
    expect(state.noButtonFleeCount).toBe(1);
  });

  it("replays from the accepted state back to idle", () => {
    const store = createProposalStore();
    store.getState().accept();
    store.getState().moveNoButton({ x: 10, y: 10 });
    store.getState().replay();

    const state = store.getState();
    expect(state.proposalAccepted).toBe(false);
    expect(state.animationState).toBe("idle");
    expect(state.noButtonPosition).toBeNull();
    expect(state.noButtonFleeCount).toBe(0);
  });
});
