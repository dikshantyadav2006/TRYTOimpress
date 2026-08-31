"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type LucideIcon, LayoutGrid, List, Upload } from "lucide-react";

import type { GalleryCategory, GalleryImage } from "@repo/shared";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/components/crud";
import { SearchInput, SegmentedControl } from "@/components/ui";
import { BulkBar, SelectAllButton, SelectButton, bulkDelete, useBulkSelection } from "@/components/bulk";
import { GalleryGrid } from "@/components/gallery-grid";
import { useData } from "@/lib/use-data";
import { put } from "@/lib/api";
import { useToast } from "@/components/toast";

const CATEGORY_OPTIONS: { value: GalleryCategory; label: string }[] = [
  { value: "moment", label: "Moment" },
  { value: "story", label: "Story" },
  { value: "favourite", label: "Favourite" },
];

const VIEW_KEY = "gallery-view";

type GalleryView = "grid" | "list";

const VIEW_OPTIONS: { value: GalleryView; label: string; icon: LucideIcon }[] = [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "list", label: "List", icon: List },
];

export default function GalleryPage() {
  const { data: images, loading, error, reloadSilently } = useData<GalleryImage>("/gallery");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [bulkCategory, setBulkCategory] = useState<GalleryCategory>("moment");
  const [view, setView] = useState<GalleryView>("grid");
  const { showToast } = useToast();

  useEffect(() => {
    const stored = window.localStorage.getItem(VIEW_KEY);
    if (stored === "grid" || stored === "list") setView(stored);
  }, []);

  const setViewPersisted = (next: GalleryView) => {
    setView(next);
    window.localStorage.setItem(VIEW_KEY, next);
  };

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
      void reloadSilently();
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
      void reloadSilently();
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
            <SegmentedControl
              name="Layout"
              value={view}
              onChange={setViewPersisted}
              options={VIEW_OPTIONS}
              className="w-auto"
            />
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
      ) : (
        <GalleryGrid
          images={sorted}
          view={view}
          onChanged={() => void reloadSilently()}
          selecting={bulk.selecting}
          selected={bulk.selected}
          onToggle={bulk.toggle}
        />
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
