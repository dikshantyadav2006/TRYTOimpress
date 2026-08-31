"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { type LucideIcon, LayoutGrid, List, Loader2, Upload } from "lucide-react";

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
import { ApiError, get, put } from "@/lib/api";
import { useToast } from "@/components/toast";

const PAGE_SIZE = 24;

interface GalleryFeedResponse {
  items: GalleryImage[];
  total: number;
  hasMore: boolean;
  nextPage: number | null;
}

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

const COLUMN_KEY = "gallery-columns";

type GalleryColumns = 2 | 3 | 4;

const COLUMN_OPTIONS: { value: string; label: string }[] = [
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
];

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string>();

  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [bulkCategory, setBulkCategory] = useState<GalleryCategory>("moment");
  const [view, setView] = useState<GalleryView>("grid");
  const [columns, setColumns] = useState<GalleryColumns>(2);
  const { showToast } = useToast();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(async (pageToLoad: number, append = false) => {
    try {
      const response = await get<{ data: GalleryFeedResponse }>(
        `/gallery?page=${pageToLoad}&pageSize=${PAGE_SIZE}`,
      );
      const feed = response.data;
      setImages((current) => {
        if (!append) return feed.items;
        const existingIds = new Set(current.map((item) => item.id));
        const newItems = feed.items.filter((item) => !existingIds.has(item.id));
        return [...current, ...newItems];
      });
      setHasMore(feed.hasMore);
      setNextPage(feed.nextPage);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load gallery images");
    }
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    await fetchPage(1, false);
    setLoading(false);
  }, [fetchPage]);

  const reloadSilently = useCallback(async () => {
    await fetchPage(1, false);
  }, [fetchPage]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const loadNext = useCallback(async () => {
    if (loading || loadingMore || !hasMore || nextPage === null) return;
    setLoadingMore(true);
    await fetchPage(nextPage, true);
    setLoadingMore(false);
  }, [loading, loadingMore, hasMore, nextPage, fetchPage]);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadNext();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [loadNext]);

  useEffect(() => {
    const storedView = window.localStorage.getItem(VIEW_KEY);
    if (storedView === "grid" || storedView === "list") setView(storedView);
    const storedColumns = window.localStorage.getItem(COLUMN_KEY);
    if (storedColumns === "2" || storedColumns === "3" || storedColumns === "4") {
      setColumns(Number(storedColumns) as GalleryColumns);
    }
  }, []);

  const setViewPersisted = (next: GalleryView) => {
    setView(next);
    window.localStorage.setItem(VIEW_KEY, next);
  };

  const setColumnsPersisted = (next: string) => {
    const value = Number(next) as GalleryColumns;
    setColumns(value);
    window.localStorage.setItem(COLUMN_KEY, next);
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
  if (error && images.length === 0) return <ErrorState message={error} />;

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
            {view === "grid" && (
              <SegmentedControl
                name="Columns"
                value={String(columns)}
                onChange={setColumnsPersisted}
                options={COLUMN_OPTIONS}
                size="sm"
                className="w-auto"
              />
            )}
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
        <>
          <GalleryGrid
            images={sorted}
            view={view}
            columns={columns}
            onChanged={() => void reloadSilently()}
            selecting={bulk.selecting}
            selected={bulk.selected}
            onToggle={bulk.toggle}
          />
          <div ref={sentinelRef} className="h-10 w-full" />
          {loadingMore && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
            </div>
          )}
          {!hasMore && sorted.length >= PAGE_SIZE && (
            <p className="py-6 text-center text-xs font-semibold uppercase tracking-wider text-white/40">
              All photos loaded ({sorted.length})
            </p>
          )}
        </>
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
