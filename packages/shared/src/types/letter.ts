export type LetterId = string;

export interface Letter {
  id: LetterId;
  emoji: string;
  title: string;
  message: string;
  order: number;
  createdAt: string;
}
