import type { GalleryImage } from "@repo/shared";

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  caption: string;
  isVideo?: boolean;
  featured?: boolean;
  category?: string;
}

export type GalleryTheme =
  | "masonry"
  | "bento"
  | "featured"
  | "polaroid"
  | "carousel"
  | "grid";

export const GALLERY_THEMES: readonly GalleryTheme[] = [
  "masonry",
  "bento",
  "featured",
  "polaroid",
  "carousel",
  "grid",
];

export function pickRandomTheme(previous?: GalleryTheme | null): GalleryTheme {
  const pool = GALLERY_THEMES.filter((theme) => theme !== previous);
  return pool[Math.floor(Math.random() * pool.length)] ?? GALLERY_THEMES[0]!;
}

export function mapFeedEntry(entry: GalleryImage): GalleryItem | null {
  if (!entry.imageUrl) return null;
  return {
    id: entry.id,
    src: entry.imageUrl,
    alt: entry.caption,
    caption: entry.caption,
    featured: entry.featured,
    category: entry.category,
    isVideo: entry.imageUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i) !== null,
  };
}
