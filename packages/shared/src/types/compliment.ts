export type ComplimentId = string;

export interface Compliment {
  id: ComplimentId;
  emoji: string;
  text: string;
  order: number;
  createdAt: string;
}
