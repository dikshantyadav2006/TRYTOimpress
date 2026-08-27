import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { SongsDeck } from "@/components/songs/songs-deck";
import { StepNav } from "@/components/step-nav";
import { getPage, getSongs } from "@/lib/content";
import { siteHref, type SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "songs");
  return {
    title: page?.title ?? "Our Songs",
    description: page?.subtitle,
  };
}

export default async function SongsPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [songs, page] = await Promise.all([getSongs(slug), getPage(slug, "songs")]);

  if (!page) notFound();

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 04 · our soundtrack"
        title={page.title}
        subtitle={page.subtitle}
      />

      <SongsDeck songs={songs} />

      <StepNav
        step={5}
        total={19}
        back={siteHref(slug, "/reasons")}
        next={page.cta ? { ...page.cta, href: siteHref(slug, page.cta.href) } : null}
      />
    </>
  );
}
