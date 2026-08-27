export type CapsuleId = string;

export interface Capsule {
  id: CapsuleId;
  emoji: string;
  title: string;
  message: string;
  unlockDate: string;
  order: number;
  createdAt: string;
}
