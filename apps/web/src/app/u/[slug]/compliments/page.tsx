import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { ComplimentShower } from "@/components/love/compliment-shower";
import { StepNav } from "@/components/step-nav";
import { getChapterNav } from "@/lib/chapters";
import { getCompliments, getPage } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "compliments");
  return {
    title: page?.title ?? "Compliments For You",
    description: page?.subtitle,
  };
}

export default async function ComplimentsPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [compliments, page] = await Promise.all([getCompliments(slug), getPage(slug, "compliments")]);

  if (!page) notFound();

  const nav = await getChapterNav(slug, "compliments");

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 09 · compliments for you"
        title={page.title}
        subtitle={page.subtitle}
      />

      <ComplimentShower compliments={compliments} />

      <StepNav
        step={nav.step}
        total={nav.total}
        back={nav.back}
        next={nav.next}
      />
    </>
  );
}
