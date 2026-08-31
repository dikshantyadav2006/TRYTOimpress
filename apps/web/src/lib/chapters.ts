import { getSitePages } from "@/lib/content";

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

export function chapterHref(slug: string, pageSlug: string): string {
  if (DEDICATED_ROUTES.has(pageSlug)) {
    return `/u/${slug}/${pageSlug}`;
  }
  return `/u/${slug}/pages/${pageSlug}`;
}

export interface ChapterNav {
  step: number;
  total: number;
  back: string | null;
  next: { href: string; label: string } | null;
}

export interface ChapterLink {
  slug: string;
  title: string;
  href: string;
}

export async function getChapterLinks(slug: string): Promise<ChapterLink[]> {
  const pages = await getSitePages(slug);
  return pages
    .filter((page) => page.published && page.chapter)
    .sort((a, b) => a.order - b.order)
    .map((page) => ({ slug: page.slug, title: page.title, href: chapterHref(slug, page.slug) }));
}

export async function getChapterNav(slug: string, pageSlug: string): Promise<ChapterNav> {
  const chapters = await getChapterLinks(slug);
  const index = chapters.findIndex((chapter) => chapter.slug === pageSlug);
  const total = chapters.length;
  if (index < 0) {
    return { step: 0, total: 0, back: null, next: null };
  }
  const prev = chapters[index - 1];
  const next = chapters[index + 1];
  return {
    step: index + 1,
    total,
    back: prev ? prev.href : null,
    next: next ? { href: next.href, label: "Next chapter" } : null,
  };
}
