import type { ProposalId } from "./proposal";

export type AnalyticsEventName =
  | "proposal_view"
  | "proposal_yes_click"
  | "proposal_no_escape"
  | "proposal_replay"
  | "proposal_share_copy";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  proposalId: ProposalId;
  payload?: Record<string, unknown>;
  timestamp: string;
}
