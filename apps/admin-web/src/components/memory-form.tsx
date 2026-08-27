"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Memory } from "@repo/shared";

import {
  FormFooter,
  Input,
  Label,
  SectionCard,
  Textarea,
} from "@/components/ui";
import { UploadField } from "@/components/upload-field";
import { useDirtyGuard } from "@/components/dirty-guard";
import { ApiError, post, put } from "@/lib/api";

export function MemoryForm({ memory }: { memory?: Memory | null }) {
  const router = useRouter();
  const isEdit = Boolean(memory);

  const [title, setTitle] = useState(memory?.title ?? "");
  const [date, setDate] = useState(memory?.date ?? "");
  const [caption, setCaption] = useState(memory?.caption ?? "");
  const [imageUrl, setImageUrl] = useState(memory?.imageUrl ?? "");
  const [order, setOrder] = useState(String(memory?.order ?? ""));
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useDirtyGuard({ title, date, caption, imageUrl, order });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    const body = {
      title,
      date,
      caption,
      ...(imageUrl ? { imageUrl } : {}),
      ...(order !== "" ? { order: Number(order) } : {}),
    };
    try {
      if (isEdit && memory) {
        await put(`/memories/${memory.id}`, body);
      } else {
        await post("/memories", body);
      }
      router.push("/memories");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      <SectionCard title="Details" description="The story timeline entry.">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </div>
        <div>
          <Label htmlFor="date">Date label</Label>
          <Input id="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        </div>
        <div>
          <Label htmlFor="caption">Caption</Label>
          <Textarea
            id="caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            required
          />
        </div>
      </SectionCard>

      <SectionCard title="Image & order" description="Pick an image and where it sits in the timeline.">
        <div>
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            value={order}
            onChange={(event) => setOrder(event.target.value)}
          />
        </div>
        <div>
          <Label>Image</Label>
          <UploadField value={imageUrl} onChange={setImageUrl} />
        </div>
      </SectionCard>

      <FormFooter loading={loading} error={error} submitLabel={isEdit ? "Save changes" : "Create memory"} />
    </form>
  );
}
