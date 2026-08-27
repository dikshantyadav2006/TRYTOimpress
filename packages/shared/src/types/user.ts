import type { Locale } from "./proposal";

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  locale: Locale;
  createdAt: string;
}
