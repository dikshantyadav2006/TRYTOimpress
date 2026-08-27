import type { Metadata } from "next";

import { MusicProvider, MusicToggle } from "@repo/ui";

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
  try {
    const settings = await getSiteSettings(slug);
    const url = settings.music?.backgroundAudioUrl?.trim();
    if (url) backgroundMusicUrl = url;
  } catch {
    backgroundMusicUrl = undefined;
  }

  return (
    <MusicProvider {...(backgroundMusicUrl ? { backgroundMusicUrl } : {})}>
      <MusicToggle />
      {children}
    </MusicProvider>
  );
}
