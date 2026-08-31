import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { DaysTogether } from "@/components/love/days-together";
import { Stargazing } from "@/components/love/stargazing";
import { StepNav } from "@/components/step-nav";
import { StoryTimeline } from "@/components/story/story-timeline";
import { getChapterNav } from "@/lib/chapters";
import { getMemories, getPage, getSiteSettings } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "our-story");
  return {
    title: page?.title ?? "Our Story",
    description: page?.subtitle,
  };
}

export default async function OurStoryPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [memories, page, settings] = await Promise.all([
    getMemories(slug),
    getPage(slug, "our-story"),
    getSiteSettings(slug),
  ]);

  if (!page) notFound();

  const nav = await getChapterNav(slug, "our-story");

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 01 · how it began"
        title={page.title}
        subtitle={page.subtitle}
      />

      <Stargazing
        startDate={settings.love?.startDate || undefined}
        startLabel={settings.love?.startLabel || undefined}
      />

      <div className="h-14" />

      <DaysTogether
        startDate={settings.love?.startDate || undefined}
        startLabel={settings.love?.startLabel || undefined}
      />

      <div className="h-20" />

      <StoryTimeline memories={memories} />

      <StepNav
        step={nav.step}
        total={nav.total}
        back={nav.back}
        next={nav.next}
      />
    </>
  );
}
