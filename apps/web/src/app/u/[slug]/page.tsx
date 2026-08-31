import type { Metadata } from "next";
import { Landing } from "@/components/landing/landing";
import { getFirstChapter } from "@/lib/chapters";
import { getSiteSettings } from "@/lib/content";
import { siteHref, type SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const settings = await getSiteSettings(slug);
  return {
    title: settings.siteTitle,
    description: settings.landing?.intro ?? undefined,
  };
}

export default async function SiteHomePage({ params }: SitePageProps) {
  const { slug } = await params;
  const settings = await getSiteSettings(slug);
  const firstChapter = await getFirstChapter(slug);
  return (
    <Landing
      content={{
        heroText: settings.landing.heroText,
        intro: settings.landing.intro,
        ctaLabel: settings.landing.ctaLabel,
        footer: settings.landing.footer,
        ctaHref: firstChapter?.href ?? siteHref(slug, "/our-story"),
        ...(settings.landing.heroImageUrl ? { heroImageUrl: settings.landing.heroImageUrl } : {}),
        ...(settings.music?.landingYoutubeId ? { youtubeId: settings.music.landingYoutubeId } : {}),
      }}
    />
  );
}
