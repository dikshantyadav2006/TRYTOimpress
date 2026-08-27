export type ReasonId = string;

export interface Reason {
  id: ReasonId;
  emoji: string;
  title: string;
  detail: string;
  order: number;
  createdAt: string;
}
