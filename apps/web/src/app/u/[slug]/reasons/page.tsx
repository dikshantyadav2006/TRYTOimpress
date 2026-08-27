import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { ReasonsWall } from "@/components/reasons/reasons-wall";
import { StepNav } from "@/components/step-nav";
import { getPage, getReasons } from "@/lib/content";
import { siteHref, type SitePageProps } from "@/lib/site";

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

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 03 · why you"
        title={page.title}
        subtitle={page.subtitle}
      />

      <ReasonsWall reasons={reasons} />

      <StepNav
        step={4}
        total={19}
        back={siteHref(slug, "/gallery")}
        next={page.cta ? { ...page.cta, href: siteHref(slug, page.cta.href) } : null}
      />
    </>
  );
}
