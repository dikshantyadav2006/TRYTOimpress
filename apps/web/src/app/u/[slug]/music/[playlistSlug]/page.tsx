import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlaylistExperience } from "@/components/songs/playlist-experience";
import { getPlaylist, getPlaylists } from "@/lib/content";

export const dynamic = "force-dynamic";

interface MusicPageProps {
  params: Promise<{ slug: string; playlistSlug: string }>;
}

export async function generateMetadata({ params }: MusicPageProps): Promise<Metadata> {
  const { slug, playlistSlug } = await params;
  const playlist = await getPlaylist(slug, playlistSlug);
  return {
    title: playlist?.name ?? "Playlist",
    description: playlist?.description ?? playlist?.quotes[0] ?? "A playlist made with love.",
  };
}

export default async function MusicPlaylistPage({ params }: MusicPageProps) {
  const { slug, playlistSlug } = await params;
  const [playlist, allPlaylists] = await Promise.all([
    getPlaylist(slug, playlistSlug),
    getPlaylists(slug),
  ]);

  if (!playlist) notFound();

  return (
    <PlaylistExperience playlist={playlist} siteSlug={slug} allPlaylists={allPlaylists} />
  );
}