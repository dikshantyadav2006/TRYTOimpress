export type DreamId = string;

export interface Dream {
  id: DreamId;
  emoji: string;
  title: string;
  text: string;
  order: number;
  createdAt: string;
}
