import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { DateWheel } from "@/components/dates/date-wheel";
import { StepNav } from "@/components/step-nav";
import { getChapterNav } from "@/lib/chapters";
import { getDateIdeas, getPage } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "dates");
  return {
    title: page?.title ?? "Dates I Can't Wait For",
    description: page?.subtitle,
  };
}

export default async function DatesPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [dates, page] = await Promise.all([getDateIdeas(slug), getPage(slug, "dates")]);

  if (!page) notFound();

  const nav = await getChapterNav(slug, "dates");

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 05 · our next adventure"
        title={page.title}
        subtitle={page.subtitle}
      />

      <DateWheel dates={dates} />

      <StepNav
        step={nav.step}
        total={nav.total}
        back={nav.back}
        next={nav.next}
      />
    </>
  );
}
