"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Reason } from "@repo/shared";

import { FormFooter, Input, Label, SectionCard, Textarea } from "@/components/ui";
import { useDirtyGuard } from "@/components/dirty-guard";
import { ApiError, post, put } from "@/lib/api";

export function ReasonForm({ reason }: { reason?: Reason | null }) {
  const router = useRouter();
  const isEdit = Boolean(reason);

  const [emoji, setEmoji] = useState(reason?.emoji ?? "");
  const [title, setTitle] = useState(reason?.title ?? "");
  const [detail, setDetail] = useState(reason?.detail ?? "");
  const [order, setOrder] = useState(String(reason?.order ?? ""));
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useDirtyGuard({ emoji, title, detail, order });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);

    const body = {
      title,
      detail,
      ...(emoji.trim() ? { emoji: emoji.trim() } : {}),
      ...(order !== "" ? { order: Number(order) } : {}),
    };
    try {
      if (isEdit && reason) {
        await put(`/reasons/${reason.id}`, body);
      } else {
        await post("/reasons", body);
      }
      router.push("/reasons");
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
        title="The reason"
        description="A reason why you love her, shown as a tap-to-reveal card."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="emoji">Emoji</Label>
            <Input
              id="emoji"
              value={emoji}
              onChange={(event) => setEmoji(event.target.value)}
              placeholder="🌹"
              maxLength={8}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Your smile"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="detail">Why (a sentence or two)</Label>
          <Textarea
            id="detail"
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="One message from you and my whole day changes…"
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
        submitLabel={isEdit ? "Save changes" : "Add reason"}
      />
    </form>
  );
}
