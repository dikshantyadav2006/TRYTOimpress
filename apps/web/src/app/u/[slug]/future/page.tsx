import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { FutureTimeline } from "@/components/love/future-timeline";
import { StepNav } from "@/components/step-nav";
import { getChapterNav } from "@/lib/chapters";
import { getDreams, getPage } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "future");
  return {
    title: page?.title ?? "Our Future",
    description: page?.subtitle,
  };
}

export default async function FuturePage({ params }: SitePageProps) {
  const { slug } = await params;
  const [dreams, page] = await Promise.all([getDreams(slug), getPage(slug, "future")]);

  if (!page) notFound();

  const nav = await getChapterNav(slug, "future");

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 12 · the future"
        title={page.title}
        subtitle={page.subtitle}
      />

      <FutureTimeline dreams={dreams} />

      <StepNav
        step={nav.step}
        total={nav.total}
        back={nav.back}
        next={nav.next}
      />
    </>
  );
}
