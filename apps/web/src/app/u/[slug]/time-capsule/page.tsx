import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { TimeCapsule } from "@/components/love/time-capsule";
import { StepNav } from "@/components/step-nav";
import { getCapsules, getPage } from "@/lib/content";
import { siteHref, type SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "time-capsule");
  return {
    title: page?.title ?? "A Time Capsule",
    description: page?.subtitle,
  };
}

export default async function TimeCapsulePage({ params }: SitePageProps) {
  const { slug } = await params;
  const [capsules, page] = await Promise.all([getCapsules(slug), getPage(slug, "time-capsule")]);

  if (!page) notFound();

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 14 · sealed for you"
        title={page.title}
        subtitle={page.subtitle}
      />

      <TimeCapsule capsules={capsules} />

      <StepNav
        step={15}
        total={19}
        back={siteHref(slug, "/letters")}
        next={page.cta ? { ...page.cta, href: siteHref(slug, page.cta.href) } : null}
      />
    </>
  );
}
