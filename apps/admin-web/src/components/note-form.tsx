"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { LoveNote } from "@repo/shared";

import { FormFooter, Input, Label, SectionCard, Textarea } from "@/components/ui";
import { useDirtyGuard } from "@/components/dirty-guard";
import { ApiError, post, put } from "@/lib/api";

export function NoteForm({ note }: { note?: LoveNote | null }) {
  const router = useRouter();
  const isEdit = Boolean(note);

  const [emoji, setEmoji] = useState(note?.emoji ?? "");
  const [text, setText] = useState(note?.text ?? "");
  const [order, setOrder] = useState(String(note?.order ?? ""));
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useDirtyGuard({ emoji, text, order });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);

    const body = {
      text,
      ...(emoji.trim() ? { emoji: emoji.trim() } : {}),
      ...(order !== "" ? { order: Number(order) } : {}),
    };
    try {
      if (isEdit && note) {
        await put(`/notes/${note.id}`, body);
      } else {
        await post("/notes", body);
      }
      router.push("/notes");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      <SectionCard
        title="The note"
        description="A tiny love note that gets pulled from the jar."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="emoji">Emoji</Label>
            <Input
              id="emoji"
              value={emoji}
              onChange={(event) => setEmoji(event.target.value)}
              placeholder="💌"
              maxLength={8}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              value={order}
              onChange={(event) => setOrder(event.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="text">Note</Label>
          <Textarea
            id="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="You make every morning feel like a fresh start…"
            required
          />
        </div>
      </SectionCard>

      <FormFooter
        loading={loading}
        error={error}
        submitLabel={isEdit ? "Save changes" : "Add note"}
      />
    </form>
  );
}
