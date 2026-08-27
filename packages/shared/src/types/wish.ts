export type WishId = string;

export interface Wish {
  id: WishId;
  emoji: string;
  text: string;
  order: number;
  createdAt: string;
}
