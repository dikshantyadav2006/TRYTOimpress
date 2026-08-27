import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { LetterEnvelopes } from "@/components/letters/letter-envelopes";
import { StepNav } from "@/components/step-nav";
import { getLetters, getPage } from "@/lib/content";
import { siteHref, type SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "letters");
  return {
    title: page?.title ?? "Open When…",
    description: page?.subtitle,
  };
}

export default async function LettersPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [letters, page] = await Promise.all([getLetters(slug), getPage(slug, "letters")]);

  if (!page) notFound();

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 13 · words for every moment"
        title={page.title}
        subtitle={page.subtitle}
      />

      <LetterEnvelopes letters={letters} />

      <StepNav
        step={14}
        total={19}
        back={siteHref(slug, "/future")}
        next={page.cta ? { ...page.cta, href: siteHref(slug, page.cta.href) } : null}
      />
    </>
  );
}
