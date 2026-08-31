import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { PromiseCards } from "@/components/love/promise-cards";
import { StepNav } from "@/components/step-nav";
import { getChapterNav } from "@/lib/chapters";
import { getLovePromises, getPage } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "promises");
  return {
    title: page?.title ?? "Promises",
    description: page?.subtitle,
  };
}

export default async function PromisesPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [promises, page] = await Promise.all([getLovePromises(slug), getPage(slug, "promises")]);

  if (!page) notFound();

  const nav = await getChapterNav(slug, "promises");

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 11 · promises to you"
        title={page.title}
        subtitle={page.subtitle}
      />

      <PromiseCards promises={promises} />

      <StepNav
        step={nav.step}
        total={nav.total}
        back={nav.back}
        next={nav.next}
      />
    </>
  );
}
