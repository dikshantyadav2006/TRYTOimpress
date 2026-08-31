import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { StepNav } from "@/components/step-nav";
import { getChapterNav } from "@/lib/chapters";
import { getPage, getPlaylists } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "songs");
  return {
    title: page?.title ?? "Our Playlists",
    description: page?.subtitle ?? "the soundtrack of us",
  };
}

const MOOD_LABELS: Record<string, string> = {
  love: "love",
  "miss-you": "miss you",
  sad: "sad hours",
  rain: "rainy",
  night: "late night",
};

export default async function SongsPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [playlists, page] = await Promise.all([getPlaylists(slug), getPage(slug, "songs")]);

  if (!page) notFound();

  const nav = await getChapterNav(slug, "songs");

  return (
    <>
      <ChapterHeader
        eyebrow="chapter 04 · our soundtrack"
        title={page.title}
        subtitle={page.subtitle}
      />

      {playlists.length === 0 ? (
        <p className="text-white/50 mx-auto max-w-md px-6 pb-10 pt-4 text-center font-serif italic">
          No playlists yet — check back soon. 🎵
        </p>
      ) : (
        <div className="mx-auto grid max-w-5xl gap-5 px-6 pb-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/u/${slug}/music/${playlist.slug}`}
              className="group border-white/10 bg-white/[0.02] hover:border-rose-400/30 hover:bg-white/[0.04] relative overflow-hidden rounded-3xl border p-4 shadow-xl shadow-black/30 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="relative overflow-hidden rounded-2xl">
                <div
                  className="aspect-video w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: playlist.coverImage
                      ? `url(${playlist.coverImage})`
                      : `linear-gradient(135deg, ${playlist.theme.accentColor}66, ${playlist.theme.overlayColor})`,
                  }}
                />
                <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/80 ring-1 ring-white/20 backdrop-blur-sm">
                  {MOOD_LABELS[playlist.mood] ?? playlist.mood}
                </span>
              </div>
              <h3 className="text-foreground mt-4 font-serif text-2xl leading-tight">
                {playlist.name}
              </h3>
              {playlist.description && (
                <p className="mt-1 line-clamp-1 text-sm text-white/50">{playlist.description}</p>
              )}
              <p className="mt-3 text-xs font-medium uppercase tracking-widest text-white/35">
                {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
              </p>
            </Link>
          ))}
        </div>
      )}

      <StepNav
        step={nav.step}
        total={nav.total}
        back={nav.back}
        next={nav.next}
      />
    </>
  );
}