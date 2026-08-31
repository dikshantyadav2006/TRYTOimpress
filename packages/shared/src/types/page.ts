export type PageBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; imageUrl: string; alt?: string };

export interface Page {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  heroImageUrl?: string;
  blocks: PageBlock[];
  cta?: { label: string; href: string } | null;
  order: number;
  published: boolean;
  chapter?: boolean;
  createdAt: string;
  updatedAt: string;
}
