import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { ScratchCards } from "@/components/love/scratch-cards";
import { StepNav } from "@/components/step-nav";
import { getChapterNav } from "@/lib/chapters";
import { getPage, getSurprises } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "scratch-cards");
  return {
    title: page?.title ?? "Scratch Cards",
    description: page?.subtitle,
  };
}

export default async function ScratchCardsPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [surprises, page] = await Promise.all([getSurprises(slug), getPage(slug, "scratch-cards")]);

  if (!page) notFound();

  const nav = await getChapterNav(slug, "scratch-cards");

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 15 · scratch to discover"
        title={page.title}
        subtitle={page.subtitle}
      />

      <ScratchCards surprises={surprises} />

      <StepNav
        step={nav.step}
        total={nav.total}
        back={nav.back}
        next={nav.next}
      />
    </>
  );
}
