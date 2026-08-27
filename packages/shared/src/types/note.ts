export type LoveNoteId = string;

export interface LoveNote {
  id: LoveNoteId;
  emoji: string;
  text: string;
  order: number;
  createdAt: string;
}
