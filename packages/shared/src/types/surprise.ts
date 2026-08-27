export type SurpriseId = string;

export interface Surprise {
  id: SurpriseId;
  emoji: string;
  title: string;
  message: string;
  order: number;
  createdAt: string;
}
