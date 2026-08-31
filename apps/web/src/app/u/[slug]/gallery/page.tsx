import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { GalleryExperience } from "@/components/gallery/gallery-experience";
import type { GalleryItem } from "@/components/gallery/types";
import { mapFeedEntry } from "@/components/gallery/types";
import { StepNav } from "@/components/step-nav";
import { getChapterNav } from "@/lib/chapters";
import { getGalleryFeed, getPage } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "gallery");
  return {
    title: page?.title ?? "Our Little Memories",
    description: page?.subtitle,
  };
}

export default async function GalleryPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [feed, page] = await Promise.all([getGalleryFeed(slug, 1, PAGE_SIZE), getPage(slug, "gallery")]);

  if (!page) notFound();

  const items: GalleryItem[] = feed.items
    .map((entry) => mapFeedEntry(entry))
    .filter((item): item is GalleryItem => item !== null);

  const nav = await getChapterNav(slug, "gallery");

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 02 · little moments"
        title={page.title}
        subtitle={page.subtitle}
      />

      <GalleryExperience
        initialItems={items}
        total={feed.total}
        initialHasMore={feed.hasMore}
        initialNextPage={feed.nextPage}
        slug={slug}
      />

      <StepNav
        step={nav.step}
        total={nav.total}
        back={nav.back}
        next={nav.next}
      />
    </>
  );
}
