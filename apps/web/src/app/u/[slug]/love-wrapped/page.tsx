import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { LoveWrapped, type WrappedStats } from "@/components/love/love-wrapped";
import {
  getCapsules,
  getCompliments,
  getDateIdeas,
  getDreams,
  getLetters,
  getLoveNotes,
  getLovePromises,
  getPage,
  getReasons,
  getSiteSettings,
  getSongs,
  getSurprises,
  getWishes,
} from "@/lib/content";
import { siteHref, type SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "love-wrapped");
  return {
    title: page?.title ?? "Our Year, Wrapped",
    description: page?.subtitle,
  };
}

function getDaysTogether(startDate: string): number | null {
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 86_400_000));
}

export default async function LoveWrappedPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [page, settings, reasons, songs, dates, letters, notes, compliments, wishes, promises, dreams, capsules, surprises] =
    await Promise.all([
      getPage(slug, "love-wrapped"),
      getSiteSettings(slug),
      getReasons(slug),
      getSongs(slug),
      getDateIdeas(slug),
      getLetters(slug),
      getLoveNotes(slug),
      getCompliments(slug),
      getWishes(slug),
      getLovePromises(slug),
      getDreams(slug),
      getCapsules(slug),
      getSurprises(slug),
    ]);

  if (!page) notFound();

  const stats: WrappedStats = {
    daysTogether: getDaysTogether(settings.love.startDate),
    reasons: reasons.length,
    songs: songs.length,
    dates: dates.length,
    letters: letters.length,
    notes: notes.length,
    compliments: compliments.length,
    wishes: wishes.length,
    promises: promises.length,
    dreams: dreams.length,
    capsules: capsules.length,
    surprises: surprises.length,
    ...(settings.love.startLabel ? { startLabel: settings.love.startLabel } : {}),
  };

  return (
    <>
      <ChapterHeader eyebrow="our year · wrapped" title={page.title} subtitle={page.subtitle} />

      <LoveWrapped stats={stats} slug={slug} />

      <nav className="mx-auto flex w-full max-w-2xl justify-center px-6 pb-16 pt-10">
        <Link
          href={siteHref(slug, "/yes")}
          className="group text-muted-foreground flex items-center gap-1.5 text-sm transition-colors hover:text-white/80"
        >
          <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          back to us
        </Link>
      </nav>
    </>
  );
}
