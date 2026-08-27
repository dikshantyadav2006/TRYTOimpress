"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Dream } from "@repo/shared";

import { FormFooter, Input, Label, SectionCard, Textarea } from "@/components/ui";
import { useDirtyGuard } from "@/components/dirty-guard";
import { ApiError, post, put } from "@/lib/api";

export function DreamForm({ dream }: { dream?: Dream | null }) {
  const router = useRouter();
  const isEdit = Boolean(dream);

  const [emoji, setEmoji] = useState(dream?.emoji ?? "");
  const [title, setTitle] = useState(dream?.title ?? "");
  const [text, setText] = useState(dream?.text ?? "");
  const [order, setOrder] = useState(String(dream?.order ?? ""));
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useDirtyGuard({ emoji, title, text, order });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);

    const body = {
      title,
      text,
      ...(emoji.trim() ? { emoji: emoji.trim() } : {}),
      ...(order !== "" ? { order: Number(order) } : {}),
    };
    try {
      if (isEdit && dream) {
        await put(`/dreams/${dream.id}`, body);
      } else {
        await post("/dreams", body);
      }
      router.push("/dreams");
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
        title="The dream"
        description="A milestone on the bucket-list timeline."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="emoji">Emoji</Label>
            <Input
              id="emoji"
              value={emoji}
              onChange={(event) => setEmoji(event.target.value)}
              placeholder="✈️"
              maxLength={8}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="See the northern lights"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="text">Dream (a sentence or two)</Label>
          <Textarea
            id="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Blankets, hot chocolate, and the sky dancing…"
            required
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

      <FormFooter
        loading={loading}
        error={error}
        submitLabel={isEdit ? "Save changes" : "Add dream"}
      />
    </form>
  );
}
