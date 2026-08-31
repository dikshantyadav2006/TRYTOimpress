import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { TimeCapsule } from "@/components/love/time-capsule";
import { StepNav } from "@/components/step-nav";
import { getChapterNav } from "@/lib/chapters";
import { getCapsules, getPage } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

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

  const nav = await getChapterNav(slug, "time-capsule");

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 14 · sealed for you"
        title={page.title}
        subtitle={page.subtitle}
      />

      <TimeCapsule capsules={capsules} />

      <StepNav
        step={nav.step}
        total={nav.total}
        back={nav.back}
        next={nav.next}
      />
    </>
  );
}
