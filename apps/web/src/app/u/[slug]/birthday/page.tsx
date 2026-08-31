import type { Metadata } from "next";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { BirthdayCountdown } from "@/components/love/birthday-countdown";
import { StepNav } from "@/components/step-nav";
import { getChapterNav } from "@/lib/chapters";
import { getPage, getSiteSettings } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "birthday").catch(() => null);
  return {
    title: page?.title ?? "Birthday Countdown",
    description: page?.subtitle,
  };
}

export default async function BirthdayPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [settings, page] = await Promise.all([
    getSiteSettings(slug),
    getPage(slug, "birthday").catch(() => null),
  ]);

  const title = page?.title ?? "Your Birthday";
  const subtitle = page?.subtitle ?? "counting down to the best day of the year";
  const nav = await getChapterNav(slug, "birthday");

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 20 · your special day"
        title={title}
        subtitle={subtitle}
      />

      <BirthdayCountdown date={settings.birthday?.date} message={settings.birthday?.message} />

      <div className="h-20" />

      <StepNav
        step={nav.step}
        total={nav.total}
        back={nav.back}
        next={nav.next}
      />
    </>
  );
}
