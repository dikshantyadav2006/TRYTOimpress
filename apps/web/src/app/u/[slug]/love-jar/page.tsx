import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { LoveJar } from "@/components/love/love-jar";
import { StepNav } from "@/components/step-nav";
import { getLoveNotes, getPage } from "@/lib/content";
import { siteHref, type SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "love-jar");
  return {
    title: page?.title ?? "The Love Jar",
    description: page?.subtitle,
  };
}

export default async function LoveJarPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [notes, page] = await Promise.all([getLoveNotes(slug), getPage(slug, "love-jar")]);

  if (!page) notFound();

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 08 · a jar of us"
        title={page.title}
        subtitle={page.subtitle}
      />

      <LoveJar notes={notes} />

      <StepNav
        step={9}
        total={19}
        back={siteHref(slug, "/love-meter")}
        next={page.cta ? { ...page.cta, href: siteHref(slug, page.cta.href) } : null}
      />
    </>
  );
}
