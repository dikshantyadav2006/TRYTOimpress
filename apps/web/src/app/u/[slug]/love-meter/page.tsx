import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { LoveMeter } from "@/components/love/love-meter";
import { StepNav } from "@/components/step-nav";
import { getPage, getSiteSettings } from "@/lib/content";
import { siteHref, type SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "love-meter");
  return {
    title: page?.title ?? "The Love Meter",
    description: page?.subtitle,
  };
}

export default async function LoveMeterPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [page, settings] = await Promise.all([getPage(slug, "love-meter"), getSiteSettings(slug)]);

  if (!page) notFound();

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 07 · how much"
        title={page.title}
        subtitle={page.subtitle}
      />

      <LoveMeter startDate={settings.love.startDate} startLabel={settings.love.startLabel} />

      <StepNav
        step={8}
        total={19}
        back={siteHref(slug, "/questions")}
        next={page.cta ? { ...page.cta, href: siteHref(slug, page.cta.href) } : null}
      />
    </>
  );
}
