import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { SurpriseButton } from "@/components/love/surprise-button";
import { StepNav } from "@/components/step-nav";
import { getPage, getSurprises } from "@/lib/content";
import { siteHref, type SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "surprise");
  return {
    title: page?.title ?? "One Last Surprise",
    description: page?.subtitle,
  };
}

export default async function SurprisePage({ params }: SitePageProps) {
  const { slug } = await params;
  const [surprises, page] = await Promise.all([getSurprises(slug), getPage(slug, "surprise")]);

  if (!page) notFound();

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 16 · one more surprise"
        title={page.title}
        subtitle={page.subtitle}
      />

      <SurpriseButton surprises={surprises} />

      <StepNav
        step={17}
        total={19}
        back={siteHref(slug, "/scratch-cards")}
        next={page.cta ? { ...page.cta, href: siteHref(slug, page.cta.href) } : null}
      />
    </>
  );
}
