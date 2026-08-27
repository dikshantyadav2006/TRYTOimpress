import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { ComplimentShower } from "@/components/love/compliment-shower";
import { StepNav } from "@/components/step-nav";
import { getCompliments, getPage } from "@/lib/content";
import { siteHref, type SitePageProps } from "@/lib/site";

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

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 09 · compliments for you"
        title={page.title}
        subtitle={page.subtitle}
      />

      <ComplimentShower compliments={compliments} />

      <StepNav
        step={10}
        total={19}
        back={siteHref(slug, "/love-jar")}
        next={page.cta ? { ...page.cta, href: siteHref(slug, page.cta.href) } : null}
      />
    </>
  );
}
