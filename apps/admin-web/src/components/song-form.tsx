"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Song } from "@repo/shared";
import { parseYouTubeId } from "@repo/shared";

import { FormFooter, Input, Label, SectionCard, Textarea } from "@/components/ui";
import { useDirtyGuard } from "@/components/dirty-guard";
import { ApiError, post, put } from "@/lib/api";

export function SongForm({ song }: { song?: Song | null }) {
  const router = useRouter();
  const isEdit = Boolean(song);

  const [title, setTitle] = useState(song?.title ?? "");
  const [artist, setArtist] = useState(song?.artist ?? "");
  const [youtubeInput, setYoutubeInput] = useState(song?.youtubeId ?? "");
  const [note, setNote] = useState(song?.note ?? "");
  const [order, setOrder] = useState(String(song?.order ?? ""));
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useDirtyGuard({ title, artist, youtubeInput, note, order });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);

    const youtubeId = parseYouTubeId(youtubeInput);
    if (!youtubeId) {
      setError("Enter a valid YouTube link or video ID.");
      setLoading(false);
      return;
    }

    const body = {
      title,
      artist,
      youtubeId,
      ...(note.trim() ? { note: note.trim() } : {}),
      ...(order !== "" ? { order: Number(order) } : {}),
    };
    try {
      if (isEdit && song) {
        await put(`/songs/${song.id}`, body);
      } else {
        await post("/songs", body);
      }
      router.push("/songs");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      <SectionCard title="Details" description="The song shown in the Our Songs chapter.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Perfect"
              required
            />
          </div>
          <div>
            <Label htmlFor="artist">Artist</Label>
            <Input
              id="artist"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              placeholder="Ed Sheeran"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="youtubeInput">YouTube link or video ID</Label>
          <Input
            id="youtubeInput"
            value={youtubeInput}
            onChange={(event) => setYoutubeInput(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            required
          />
        </div>
        <div>
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Why this song is ours…"
          />
        </div>
        <div>
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            value={order}
            onChange={(event) => setOrder(event.target.value)}
          />
        </div>
      </SectionCard>

      <FormFooter loading={loading} error={error} submitLabel={isEdit ? "Save changes" : "Add song"} />
    </form>
  );
}
