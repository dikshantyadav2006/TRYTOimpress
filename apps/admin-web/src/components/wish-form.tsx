"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Wish } from "@repo/shared";

import { FormFooter, Input, Label, SectionCard, Textarea } from "@/components/ui";
import { useDirtyGuard } from "@/components/dirty-guard";
import { ApiError, post, put } from "@/lib/api";

export function WishForm({ wish }: { wish?: Wish | null }) {
  const router = useRouter();
  const isEdit = Boolean(wish);

  const [emoji, setEmoji] = useState(wish?.emoji ?? "");
  const [text, setText] = useState(wish?.text ?? "");
  const [order, setOrder] = useState(String(wish?.order ?? ""));
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
      if (isEdit && wish) {
        await put(`/wishes/${wish.id}`, body);
      } else {
        await post("/wishes", body);
      }
      router.push("/wishes");
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
        title="The wish"
        description="A wish that hangs on the wish tree."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="emoji">Emoji</Label>
            <Input
              id="emoji"
              value={emoji}
              onChange={(event) => setEmoji(event.target.value)}
              placeholder="🌠"
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
          <Label htmlFor="text">Wish</Label>
          <Textarea
            id="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="I wish we never stop holding hands…"
            required
          />
        </div>
      </SectionCard>

      <FormFooter
        loading={loading}
        error={error}
        submitLabel={isEdit ? "Save changes" : "Add wish"}
      />
    </form>
  );
}
