"use client";

import { useParams } from "next/navigation";

import type { Song } from "@repo/shared";

import { SongForm } from "@/components/song-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditSongPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<Song>("/songs");
  const song = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!song) return <ErrorState message="Song not found" />;

  return (
    <div>
      <PageHeader title="Edit song" backHref="/songs" />
      <SongForm song={song} />
    </div>
  );
}
