import type { Metadata } from "next";

import { MusicProvider } from "@repo/ui";

import type { ChapterRailItem } from "@/components/chapter/chapter-rail";
import { SiteChrome } from "@/components/site-chrome";
import { getChapterLinks } from "@/lib/chapters";
import { getSiteSettings } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  let siteTitle = "Will You Be Mine?";
  let recipient = "";
  try {
    const settings = await getSiteSettings(slug);
    siteTitle = settings.siteTitle;
    recipient = settings.recipientName;
  } catch {
    // Fall back to defaults when the site cannot be resolved.
  }
  return {
    title: {
      default: siteTitle,
      template: recipient ? `%s · For ${recipient}` : "%s",
    },
    description:
      "A little journey I built just for you — eighteen little chapters, one very big question.",
  };
}

export default async function SiteLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode }> & SitePageProps) {
  const { slug } = await params;
  let backgroundMusicUrl: string | undefined;
  let chaptersEnabled = false;
  let chapterItems: ChapterRailItem[] = [];
  try {
    const settings = await getSiteSettings(slug);
    const url = settings.music?.backgroundAudioUrl?.trim();
    if (url) backgroundMusicUrl = url;
    chaptersEnabled = Boolean(settings.navigation?.chaptersEnabled);
  } catch {
    backgroundMusicUrl = undefined;
    chaptersEnabled = false;
  }

  if (chaptersEnabled) {
    try {
      chapterItems = await getChapterLinks(slug);
    } catch {
      chapterItems = [];
    }
  }

  return (
    <MusicProvider {...(backgroundMusicUrl ? { backgroundMusicUrl } : {})}>
      <SiteChrome chapterItems={chapterItems}>{children}</SiteChrome>
    </MusicProvider>
  );
}
