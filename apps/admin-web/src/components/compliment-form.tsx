"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Compliment } from "@repo/shared";

import { FormFooter, Input, Label, SectionCard, Textarea } from "@/components/ui";
import { useDirtyGuard } from "@/components/dirty-guard";
import { ApiError, post, put } from "@/lib/api";

export function ComplimentForm({ compliment }: { compliment?: Compliment | null }) {
  const router = useRouter();
  const isEdit = Boolean(compliment);

  const [emoji, setEmoji] = useState(compliment?.emoji ?? "");
  const [text, setText] = useState(compliment?.text ?? "");
  const [order, setOrder] = useState(String(compliment?.order ?? ""));
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
      if (isEdit && compliment) {
        await put(`/compliments/${compliment.id}`, body);
      } else {
        await post("/compliments", body);
      }
      router.push("/compliments");
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
        title="The compliment"
        description="A nice thing she can shower in."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="emoji">Emoji</Label>
            <Input
              id="emoji"
              value={emoji}
              onChange={(event) => setEmoji(event.target.value)}
              placeholder="💖"
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
          <Label htmlFor="text">Compliment</Label>
          <Textarea
            id="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Your smile could calm any storm…"
            required
          />
        </div>
      </SectionCard>

      <FormFooter
        loading={loading}
        error={error}
        submitLabel={isEdit ? "Save changes" : "Add compliment"}
      />
    </form>
  );
}
