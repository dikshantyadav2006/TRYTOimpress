"use client";

import { useState } from "react";

import type { Playlist, PlaylistSong } from "@repo/shared";

import {
  DeleteButton,
  EmptyState,
  ErrorState,
  ListCard,
  LoadingState,
  PageHeader,
} from "@/components/crud";
import { Badge, SearchInput } from "@/components/ui";
import { BulkBar, SelectAllButton, SelectButton, bulkDelete, useBulkSelection } from "@/components/bulk";
import { ReorderList } from "@/components/reorder";
import { useToast } from "@/components/toast";
import { useData } from "@/lib/use-data";
import type { LucideIcon } from "lucide-react";
import { Flame, ListMusic, Sparkles } from "lucide-react";

const MOOD_LABELS: Record<string, string> = {
  love: "Love",
  "miss-you": "Miss you",
  sad: "Sad",
  rain: "Rainy",
  night: "Late night",
};

function MoodBadge({ mood }: { mood: string }) {
  return <Badge tone="neutral">{MOOD_LABELS[mood] ?? mood}</Badge>;
}

function InsightCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string | undefined;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="bg-rose-500/15 text-rose-300 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </p>
        <p className="text-foreground truncate text-sm font-medium">{value}</p>
        {sub && <p className="text-muted-foreground truncate text-xs">{sub}</p>}
      </div>
    </div>
  );
}

export default function PlaylistsPage() {
  const { data: playlists, loading, error, reload } = useData<Playlist>("/playlists");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...playlists]
    .filter((playlist) =>
      needle
        ? playlist.name.toLowerCase().includes(needle) ||
          (playlist.description ?? "").toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => a.order - b.order);

  const bulk = useBulkSelection(sorted);

  let mostPlayed: Playlist | undefined;
  let mostPlayedSong: { playlist: Playlist; song: PlaylistSong } | undefined;
  let topMood: string | undefined;
  for (const playlist of playlists) {
    if (!mostPlayed || playlist.plays > mostPlayed.plays) mostPlayed = playlist;
    for (const song of playlist.songs) {
      if (!mostPlayedSong || song.plays > mostPlayedSong.song.plays) {
        mostPlayedSong = { playlist, song };
      }
    }
  }
  if (playlists.length > 0) {
    const counts = new Map<string, number>();
    for (const playlist of playlists) {
      counts.set(playlist.mood, (counts.get(playlist.mood) ?? 0) + 1);
    }
    let best = 0;
    for (const [moodValue, count] of counts) {
      if (count > best) {
        best = count;
        topMood = moodValue;
      }
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/playlists", [...bulk.selected]);
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
        title="Playlists"
        subtitle="Themed song collections shown in the Our Songs chapter."
        newHref="/playlists/new"
        newLabel="New playlist"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />

      {playlists.length > 0 && (
        <section aria-label="Analytics" className="mb-5 grid gap-2.5 sm:grid-cols-3">
          <InsightCard
            icon={Flame}
            label="Most played playlist"
            value={mostPlayed ? `${mostPlayed.name} · ${mostPlayed.plays}` : "—"}
          />
          <InsightCard
            icon={Sparkles}
            label="Top mood"
            value={topMood ? (MOOD_LABELS[topMood] ?? topMood) : "—"}
            sub={`${playlists.length} playlist${playlists.length === 1 ? "" : "s"}`}
          />
          <InsightCard
            icon={ListMusic}
            label="Most played song"
            value={mostPlayedSong ? mostPlayedSong.song.title : "—"}
            sub={
              mostPlayedSong
                ? `${mostPlayedSong.song.artist} · ${mostPlayedSong.song.plays} plays`
                : undefined
            }
          />
        </section>
      )}

      {!bulk.selecting && playlists.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search playlists…"
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
          title="No playlists yet"
          description="Create themed collections like “Miss You” or “Love Me”."
          href="/playlists/new"
          hrefLabel="Create playlist"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((playlist) => (
            <ListCard
              key={playlist.id}
              title={playlist.name}
              subtitle={playlist.description}
              thumbnail={playlist.coverImage}
              meta={playlistMeta(playlist)}
              href={`/playlists/${playlist.id}`}
              actions={<DeleteButton id={playlist.id} path="/playlists" onDeleted={reload} />}
              selectable={bulk.selecting}
              selected={bulk.selected.has(playlist.id)}
              onToggle={() => bulk.toggle(playlist.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/playlists" items={sorted} onChanged={reload}>
          {(playlist) => (
            <ListCard
              title={playlist.name}
              subtitle={playlist.description}
              thumbnail={playlist.coverImage}
              meta={playlistMeta(playlist)}
              href={`/playlists/${playlist.id}`}
              actions={<DeleteButton id={playlist.id} path="/playlists" onDeleted={reload} />}
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

function playlistMeta(playlist: Playlist) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <MoodBadge mood={playlist.mood} />
      <Badge tone="neutral">{playlist.songs.length} songs</Badge>
      <Badge tone="rose">{playlist.plays} plays</Badge>
      <Badge tone="amber">{playlist.likes} likes</Badge>
      <Badge tone="emerald">{playlist.published ? "Published" : "Hidden"}</Badge>
    </div>
  );
}