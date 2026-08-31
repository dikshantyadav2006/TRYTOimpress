import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { ReasonsWall } from "@/components/reasons/reasons-wall";
import { StepNav } from "@/components/step-nav";
import { getChapterNav } from "@/lib/chapters";
import { getPage, getReasons } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "reasons");
  return {
    title: page?.title ?? "Why I Love You",
    description: page?.subtitle,
  };
}

export default async function ReasonsPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [reasons, page] = await Promise.all([getReasons(slug), getPage(slug, "reasons")]);

  if (!page) notFound();

  const nav = await getChapterNav(slug, "reasons");

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 03 · why you"
        title={page.title}
        subtitle={page.subtitle}
      />

      <ReasonsWall reasons={reasons} />

      <StepNav
        step={nav.step}
        total={nav.total}
        back={nav.back}
        next={nav.next}
      />
    </>
  );
}
