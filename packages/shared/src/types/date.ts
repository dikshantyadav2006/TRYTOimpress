export type DateIdeaId = string;

export interface DateIdea {
  id: DateIdeaId;
  emoji: string;
  title: string;
  description: string;
  tag: string;
  order: number;
  createdAt: string;
}
