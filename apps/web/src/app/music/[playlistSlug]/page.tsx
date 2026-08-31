import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { getDefaultSite } from "@/lib/content";

export const dynamic = "force-dynamic";

interface MusicAliasProps {
  params: Promise<{ playlistSlug: string }>;
  searchParams: Promise<{ site?: string }>;
}

export async function generateMetadata({ params }: MusicAliasProps): Promise<Metadata> {
  const { playlistSlug } = await params;
  return {
    title: "Playlist",
    description: `Playlist "${playlistSlug}" — pick a mood, press play.`,
  };
}

export default async function MusicAliasPage({ params, searchParams }: MusicAliasProps) {
  const { playlistSlug } = await params;
  const { site } = await searchParams;

  const siteSlug = (site?.trim() || process.env.NEXT_PUBLIC_DEFAULT_SITE_SLUG?.trim()) ?? null;
  const resolved =
    siteSlug ?? (await getDefaultSite().then((value) => value?.slug ?? null).catch(() => null));

  if (!resolved) notFound();
  redirect(`/u/${resolved}/music/${playlistSlug}`);
}