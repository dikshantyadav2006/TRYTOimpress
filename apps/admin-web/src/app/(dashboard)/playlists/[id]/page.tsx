"use client";

import { useParams } from "next/navigation";

import type { Playlist } from "@repo/shared";

import { PlaylistForm } from "@/components/playlist-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditPlaylistPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<Playlist>("/playlists");
  const playlist = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!playlist) return <ErrorState message="Playlist not found" />;

  return (
    <div>
      <PageHeader title="Edit playlist" backHref="/playlists" />
      <PlaylistForm playlist={playlist} />
    </div>
  );
}