export type LovePromiseId = string;

export interface LovePromise {
  id: LovePromiseId;
  emoji: string;
  title: string;
  text: string;
  order: number;
  createdAt: string;
}
