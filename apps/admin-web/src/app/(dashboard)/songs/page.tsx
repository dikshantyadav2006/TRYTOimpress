"use client";

import { useState } from "react";

import type { Song } from "@repo/shared";
import { getYouTubeThumbnail } from "@repo/shared";

import {
  DeleteButton,
  EmptyState,
  ListCard,
  LoadingState,
  PageHeader,
  ErrorState,
} from "@/components/crud";
import { Badge, SearchInput } from "@/components/ui";
import { BulkBar, SelectAllButton, SelectButton, bulkDelete, useBulkSelection } from "@/components/bulk";
import { ReorderList } from "@/components/reorder";
import { useToast } from "@/components/toast";
import { useData } from "@/lib/use-data";

export default function SongsPage() {
  const { data: songs, loading, error, reload } = useData<Song>("/songs");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...songs]
    .filter((song) =>
      needle
        ? song.title.toLowerCase().includes(needle) || song.artist.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => a.order - b.order);

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/songs", [...bulk.selected]);
      bulk.clear();
      showToast("success", "Deleted");
      void reload();
    } catch {
      showToast("error", "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Songs"
        subtitle="Songs shown in the Our Songs chapter."
        newHref="/songs/new"
        newLabel="New song"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />
      {!bulk.selecting && songs.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by title or artist…"
          className="mb-4"
        />
      )}
      {bulk.selecting && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-sm">
            {bulk.selected.size} selected — tap cards to toggle
          </p>
          <SelectAllButton allSelected={bulk.allSelected} onToggle={bulk.toggleAll} />
        </div>
      )}
      {sorted.length === 0 ? (
        <EmptyState
          title="No songs yet"
          description="Add the first song to the Our Songs chapter."
          href="/songs/new"
          hrefLabel="Add song"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((song) => (
            <ListCard
              key={song.id}
              title={song.title}
              subtitle={song.artist}
              thumbnail={getYouTubeThumbnail(song.youtubeId)}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="rose">{song.artist}</Badge>
                  <Badge tone="neutral">#{song.order}</Badge>
                </div>
              }
              href={`/songs/${song.id}`}
              actions={<DeleteButton id={song.id} path="/songs" onDeleted={reload} />}
              selectable={bulk.selecting}
              selected={bulk.selected.has(song.id)}
              onToggle={() => bulk.toggle(song.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/songs" items={sorted} onChanged={reload}>
          {(song) => (
            <ListCard
              title={song.title}
              subtitle={song.artist}
              thumbnail={getYouTubeThumbnail(song.youtubeId)}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="rose">{song.artist}</Badge>
                  <Badge tone="neutral">#{song.order}</Badge>
                </div>
              }
              href={`/songs/${song.id}`}
              actions={<DeleteButton id={song.id} path="/songs" onDeleted={reload} />}
            />
          )}
        </ReorderList>
      )}

      {bulk.selecting && (
        <BulkBar
          count={bulk.selected.size}
          onClear={bulk.clear}
          onDelete={() => void onBulkDelete()}
          deleting={deleting}
        />
      )}
    </div>
  );
}
