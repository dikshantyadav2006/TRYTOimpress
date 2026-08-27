"use client";

import Link from "next/link";
import { useState } from "react";
import { Upload } from "lucide-react";

import type { GalleryCategory, GalleryImage } from "@repo/shared";

import {
  DeleteButton,
  EmptyState,
  ListCard,
  LoadingState,
  PageHeader,
  ErrorState,
} from "@/components/crud";
import { Badge, SearchInput, SegmentedControl } from "@/components/ui";
import { BulkBar, SelectAllButton, SelectButton, bulkDelete, useBulkSelection } from "@/components/bulk";
import { ReorderList } from "@/components/reorder";
import { useData } from "@/lib/use-data";
import { put } from "@/lib/api";
import { useToast } from "@/components/toast";

const CATEGORY_OPTIONS: { value: GalleryCategory; label: string }[] = [
  { value: "moment", label: "Moment" },
  { value: "story", label: "Story" },
  { value: "favourite", label: "Favourite" },
];

export default function GalleryPage() {
  const { data: images, loading, error, reload } = useData<GalleryImage>("/gallery");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [bulkCategory, setBulkCategory] = useState<GalleryCategory>("moment");
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...images]
    .filter((image) =>
      needle
        ? image.caption.toLowerCase().includes(needle) ||
          image.category.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/gallery", [...bulk.selected]);
      bulk.clear();
      showToast("success", "Deleted");
      void reload();
    } catch {
      showToast("error", "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const onBulkCategory = async (category: GalleryCategory) => {
    try {
      await Promise.all(
        [...bulk.selected].map((id) => put(`/gallery/${id}`, { category })),
      );
      showToast("success", `Moved ${bulk.selected.size} to ${category}`);
      void reload();
    } catch {
      showToast("error", "Update failed");
    }
  };

  return (
    <div>
      <PageHeader
        title="Gallery"
        subtitle="Photos shown on the gallery chapter."
        newHref="/gallery/new"
        newLabel="New image"
        action={
          <div className="flex shrink-0 items-center gap-2">
            <SelectButton
              selecting={bulk.selecting}
              onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
            />
            <Link
              href="/gallery/bulk"
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Bulk upload</span>
              <span className="sm:hidden">Bulk</span>
            </Link>
          </div>
        }
      />
      {!bulk.selecting && images.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by caption or category…"
          className="mb-4"
        />
      )}
      {bulk.selecting && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-sm">
            {bulk.selected.size} selected — tap cards to toggle
          </p>
          <SelectAllButton allSelected={bulk.allSelected} onToggle={bulk.toggleAll} />
        </div>
      )}
      {sorted.length === 0 ? (
        <EmptyState
          title="No images yet"
          description="Add the first photo to the gallery."
          href="/gallery/new"
          hrefLabel="Add image"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((image) => (
            <ListCard
              key={image.id}
              title={image.caption}
              subtitle={image.category}
              thumbnail={image.imageUrl || undefined}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="neutral">{image.category}</Badge>
                  {image.featured && <Badge tone="rose">featured</Badge>}
                  {image.imageUrl && <Badge tone="emerald">uploaded</Badge>}
                </div>
              }
              href={`/gallery/${image.id}`}
              actions={<DeleteButton id={image.id} path="/gallery" onDeleted={reload} />}
              selectable={bulk.selecting}
              selected={bulk.selected.has(image.id)}
              onToggle={() => bulk.toggle(image.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/gallery" items={sorted} onChanged={reload}>
          {(image) => (
            <ListCard
              title={image.caption}
              subtitle={image.category}
              thumbnail={image.imageUrl || undefined}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="neutral">{image.category}</Badge>
                  {image.featured && <Badge tone="rose">featured</Badge>}
                  {image.imageUrl && <Badge tone="emerald">uploaded</Badge>}
                </div>
              }
              href={`/gallery/${image.id}`}
              actions={<DeleteButton id={image.id} path="/gallery" onDeleted={reload} />}
            />
          )}
        </ReorderList>
      )}

      {bulk.selecting && (
        <BulkBar
          count={bulk.selected.size}
          onClear={bulk.clear}
          onDelete={() => void onBulkDelete()}
          deleting={deleting}
        >
          <SegmentedControl
            name="Bulk category"
            size="sm"
            value={bulkCategory}
            onChange={(category) => {
              setBulkCategory(category);
              void onBulkCategory(category);
            }}
            options={CATEGORY_OPTIONS}
            className="w-auto"
          />
        </BulkBar>
      )}
    </div>
  );
}
