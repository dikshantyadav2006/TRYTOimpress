"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { DateIdea } from "@repo/shared";

import { FormFooter, Input, Label, SectionCard, Textarea } from "@/components/ui";
import { useDirtyGuard } from "@/components/dirty-guard";
import { ApiError, post, put } from "@/lib/api";

export function DateForm({ dateIdea }: { dateIdea?: DateIdea | null }) {
  const router = useRouter();
  const isEdit = Boolean(dateIdea);

  const [emoji, setEmoji] = useState(dateIdea?.emoji ?? "");
  const [title, setTitle] = useState(dateIdea?.title ?? "");
  const [description, setDescription] = useState(dateIdea?.description ?? "");
  const [tag, setTag] = useState(dateIdea?.tag ?? "");
  const [order, setOrder] = useState(String(dateIdea?.order ?? ""));
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useDirtyGuard({ emoji, title, description, tag, order });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);

    const body = {
      title,
      description,
      ...(emoji.trim() ? { emoji: emoji.trim() } : {}),
      ...(tag.trim() ? { tag: tag.trim() } : {}),
      ...(order !== "" ? { order: Number(order) } : {}),
    };
    try {
      if (isEdit && dateIdea) {
        await put(`/dates/${dateIdea.id}`, body);
      } else {
        await post("/dates", body);
      }
      router.push("/dates");
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
        title="The date"
        description="A date idea the surprise wheel can draw for her."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="emoji">Emoji</Label>
            <Input
              id="emoji"
              value={emoji}
              onChange={(event) => setEmoji(event.target.value)}
              placeholder="🎡"
              maxLength={8}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Midnight ice cream run"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What we'd do, and why it'll be fun…"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="tag">Vibe (optional)</Label>
            <Input
              id="tag"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              placeholder="sweet"
            />
            <p className="text-muted-foreground mt-1.5 text-xs">
              free · home · sweet · adventure · silly · cozy
            </p>
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
        submitLabel={isEdit ? "Save changes" : "Add date"}
      />
    </form>
  );
}
