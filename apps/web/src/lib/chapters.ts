import { isPageVisible, sitePagePath } from "@repo/shared";

import { getSitePages } from "@/lib/content";

export function chapterHref(slug: string, pageSlug: string): string {
  return `/u/${slug}${sitePagePath(pageSlug)}`;
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
    .filter((page) => isPageVisible(page) && page.chapter)
    .sort((a, b) => a.order - b.order)
    .map((page) => ({ slug: page.slug, title: page.title, href: chapterHref(slug, page.slug) }));
}

export async function getFirstChapter(slug: string): Promise<ChapterLink | null> {
  const chapters = await getChapterLinks(slug);
  return chapters[0] ?? null;
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
