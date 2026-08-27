import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { WishTree } from "@/components/love/wish-tree";
import { StepNav } from "@/components/step-nav";
import { getPage, getWishes } from "@/lib/content";
import { siteHref, type SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "wishes");
  return {
    title: page?.title ?? "Our Wishes",
    description: page?.subtitle,
  };
}

export default async function WishesPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [wishes, page] = await Promise.all([getWishes(slug), getPage(slug, "wishes")]);

  if (!page) notFound();

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 10 · wishes for us"
        title={page.title}
        subtitle={page.subtitle}
      />

      <WishTree wishes={wishes} />

      <StepNav
        step={11}
        total={19}
        back={siteHref(slug, "/compliments")}
        next={page.cta ? { ...page.cta, href: siteHref(slug, page.cta.href) } : null}
      />
    </>
  );
}
