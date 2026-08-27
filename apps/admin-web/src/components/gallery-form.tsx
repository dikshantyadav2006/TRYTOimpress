"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Heart, Sparkles } from "lucide-react";

import type { GalleryCategory, GalleryImage } from "@repo/shared";

import {
  FormFooter,
  Input,
  Label,
  SectionCard,
  SegmentedControl,
  Switch,
} from "@/components/ui";
import { UploadField } from "@/components/upload-field";
import { useDirtyGuard } from "@/components/dirty-guard";
import { ApiError, post, put } from "@/lib/api";

const CATEGORY_OPTIONS: { value: GalleryCategory; label: string; icon: typeof Heart }[] = [
  { value: "moment", label: "Moment", icon: Sparkles },
  { value: "story", label: "Story", icon: BookOpen },
  { value: "favourite", label: "Favourite", icon: Heart },
];

export function GalleryForm({ image }: { image?: GalleryImage | null }) {
  const router = useRouter();
  const isEdit = Boolean(image);

  const [caption, setCaption] = useState(image?.caption ?? "");
  const [category, setCategory] = useState<GalleryCategory>(image?.category ?? "moment");
  const [featured, setFeatured] = useState(image?.featured ?? false);
  const [imageUrl, setImageUrl] = useState(image?.imageUrl ?? "");
  const [order, setOrder] = useState(String(image?.order ?? ""));
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useDirtyGuard({ caption, category, featured, imageUrl, order });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    if (!imageUrl) {
      setError("Upload an image first — every gallery item needs a photo.");
      setLoading(false);
      return;
    }
    const body = {
      caption,
      category,
      featured,
      imageUrl,
      ...(order !== "" ? { order: Number(order) } : {}),
    };
    try {
      if (isEdit && image) {
        await put(`/gallery/${image.id}`, body);
      } else {
        await post("/gallery", body);
      }
      router.push("/gallery");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      <SectionCard title="Details" description="The photo shown in the gallery chapter.">
        <div>
          <Label htmlFor="caption">Caption</Label>
          <Input
            id="caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            required
          />
        </div>
        <div>
          <Label>Category</Label>
          <SegmentedControl
            name="Category"
            value={category}
            onChange={setCategory}
            options={CATEGORY_OPTIONS}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              value={order}
              onChange={(event) => setOrder(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2.5 pb-3 text-sm">
              <Switch checked={featured} onChange={setFeatured} label="Featured" />
              Featured
            </label>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Image" description="Upload the photo to show in the gallery.">
        <UploadField value={imageUrl} onChange={setImageUrl} />
      </SectionCard>

      <FormFooter loading={loading} error={error} submitLabel={isEdit ? "Save changes" : "Create image"} />
    </form>
  );
}
