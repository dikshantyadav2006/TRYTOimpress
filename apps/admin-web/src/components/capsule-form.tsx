"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Capsule } from "@repo/shared";

import { FormFooter, Input, Label, SectionCard, Textarea } from "@/components/ui";
import { useDirtyGuard } from "@/components/dirty-guard";
import { ApiError, post, put } from "@/lib/api";

export function CapsuleForm({ capsule }: { capsule?: Capsule | null }) {
  const router = useRouter();
  const isEdit = Boolean(capsule);

  const [emoji, setEmoji] = useState(capsule?.emoji ?? "");
  const [title, setTitle] = useState(capsule?.title ?? "");
  const [message, setMessage] = useState(capsule?.message ?? "");
  const [unlockDate, setUnlockDate] = useState(capsule?.unlockDate ?? "");
  const [order, setOrder] = useState(String(capsule?.order ?? ""));
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useDirtyGuard({ emoji, title, message, unlockDate, order });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);

    const body = {
      title,
      message,
      ...(emoji.trim() ? { emoji: emoji.trim() } : {}),
      ...(unlockDate ? { unlockDate } : {}),
      ...(order !== "" ? { order: Number(order) } : {}),
    };
    try {
      if (isEdit && capsule) {
        await put(`/capsules/${capsule.id}`, body);
      } else {
        await post("/capsules", body);
      }
      router.push("/capsules");
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
        title="The time capsule"
        description="A message that stays sealed until its date arrives."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="emoji">Emoji</Label>
            <Input
              id="emoji"
              value={emoji}
              onChange={(event) => setEmoji(event.target.value)}
              placeholder="⏳"
              maxLength={8}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="For our 3-month anniversary"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="message">Message inside</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="If you're reading this, we made it…"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="unlockDate">Unlock date</Label>
            <Input
              id="unlockDate"
              type="date"
              value={unlockDate}
              onChange={(event) => setUnlockDate(event.target.value)}
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
        </div>
      </SectionCard>

      <FormFooter
        loading={loading}
        error={error}
        submitLabel={isEdit ? "Save changes" : "Add capsule"}
      />
    </form>
  );
}
