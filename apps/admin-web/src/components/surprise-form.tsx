"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Surprise } from "@repo/shared";

import { FormFooter, Input, Label, SectionCard, Textarea } from "@/components/ui";
import { useDirtyGuard } from "@/components/dirty-guard";
import { ApiError, post, put } from "@/lib/api";

export function SurpriseForm({ surprise }: { surprise?: Surprise | null }) {
  const router = useRouter();
  const isEdit = Boolean(surprise);

  const [emoji, setEmoji] = useState(surprise?.emoji ?? "");
  const [title, setTitle] = useState(surprise?.title ?? "");
  const [message, setMessage] = useState(surprise?.message ?? "");
  const [order, setOrder] = useState(String(surprise?.order ?? ""));
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useDirtyGuard({ emoji, title, message, order });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);

    const body = {
      title,
      message,
      ...(emoji.trim() ? { emoji: emoji.trim() } : {}),
      ...(order !== "" ? { order: Number(order) } : {}),
    };
    try {
      if (isEdit && surprise) {
        await put(`/surprises/${surprise.id}`, body);
      } else {
        await post("/surprises", body);
      }
      router.push("/surprises");
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
        title="The surprise"
        description="Used by the scratch cards and the surprise button."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="emoji">Emoji</Label>
            <Input
              id="emoji"
              value={emoji}
              onChange={(event) => setEmoji(event.target.value)}
              placeholder="🎁"
              maxLength={8}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="A slow coffee date"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="message">Surprise</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Your favourite drink, my treat, zero plans…"
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
        submitLabel={isEdit ? "Save changes" : "Add surprise"}
      />
    </form>
  );
}
