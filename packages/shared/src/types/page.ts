export type PageBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; imageUrl: string; alt?: string };

/**
 * Visibility of a page on the public site:
 * - "visible" — shown on the site, listed in the chapter navigator and home CTA.
 * - "link"    — not published, but openable by its direct URL (share without publish).
 * - "hidden"  — completely private; only visible to admins.
 */
export type PageVisibility = "visible" | "link" | "hidden";

export interface Page {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  heroImageUrl?: string;
  blocks: PageBlock[];
  cta?: { label: string; href: string } | null;
  order: number;
  visibility: PageVisibility;
  chapter?: boolean;
  createdAt: string;
  updatedAt: string;
}

export function isPageVisible(page: { visibility: PageVisibility }): boolean {
  return page.visibility === "visible";
}

export function isPageAccessible(page: { visibility: PageVisibility }): boolean {
  return page.visibility !== "hidden";
}

const DEDICATED_ROUTES = new Set([
  "our-story",
  "gallery",
  "reasons",
  "songs",
  "dates",
  "questions",
  "love-meter",
  "love-jar",
  "compliments",
  "wishes",
  "promises",
  "future",
  "letters",
  "time-capsule",
  "scratch-cards",
  "surprise",
  "proposal",
  "yes",
  "love-wrapped",
  "birthday",
]);

/** Returns the path segment for a page under a site root, e.g. "/gallery" or "/pages/myslug". */
export function sitePagePath(pageSlug: string): string {
  return DEDICATED_ROUTES.has(pageSlug) ? `/${pageSlug}` : `/pages/${pageSlug}`;
}
