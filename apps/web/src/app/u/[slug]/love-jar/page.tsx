import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { LoveJar } from "@/components/love/love-jar";
import { StepNav } from "@/components/step-nav";
import { getChapterNav } from "@/lib/chapters";
import { getLoveNotes, getPage } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

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

  const nav = await getChapterNav(slug, "love-jar");

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 08 · a jar of us"
        title={page.title}
        subtitle={page.subtitle}
      />

      <LoveJar notes={notes} />

      <StepNav
        step={nav.step}
        total={nav.total}
        back={nav.back}
        next={nav.next}
      />
    </>
  );
}
