"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { GalleryImage } from "@repo/shared";

import { GalleryModal } from "./gallery-modal";
import {
  BentoGrid,
  CarouselRows,
  FeaturedCarousel,
  MasonryGrid,
  PolaroidGrid,
  SkeletonTile,
  UniformGrid,
} from "./gallery-tiles";
import {
  type GalleryItem,
  type GalleryTheme,
  mapFeedEntry,
  pickRandomTheme,
} from "./types";
import { getGalleryFeed } from "@/lib/content";
import { canAddGallery, useShareSession } from "@/lib/media-session";

const PAGE_SIZE = 24;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function ShuffleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.8-1.1 2-1.7 3.3-1.7H22" />
      <path d="m18 2 4 4-4 4" />
      <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
      <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
      <path d="m18 14 4 4-4 4" />
    </svg>
  );
}

interface GalleryExperienceProps {
  initialItems: GalleryItem[];
  total: number;
  initialHasMore: boolean;
  initialNextPage: number | null;
  slug: string;
}

function themeSkeleton(theme: GalleryTheme): string {
  switch (theme) {
    case "grid":
      return "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4";
    case "polaroid":
      return "grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4";
    case "carousel":
      return "flex gap-3 overflow-hidden";
    case "featured":
      return "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4";
    case "bento":
    case "masonry":
    default:
      return "columns-2 gap-3 sm:columns-3 lg:columns-4";
  }
}

export function GalleryExperience({
  initialItems,
  total,
  initialHasMore,
  initialNextPage,
  slug,
}: GalleryExperienceProps) {
  const [theme, setTheme] = useState<GalleryTheme>(() => pickRandomTheme());
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextPage, setNextPage] = useState<number | null>(initialNextPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const [count, setCount] = useState(total);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string>();
  const { session } = useShareSession();
  const canAdd = canAddGallery(session);

  const loadNext = useCallback(async () => {
    if (loading || !hasMore || nextPage === null) return;
    setLoading(true);
    setError(undefined);
    try {
      const feed = await getGalleryFeed(slug, nextPage, PAGE_SIZE);
      const nextItems = feed.items
        .map(mapFeedEntry)
        .filter((item): item is GalleryItem => item !== null);
      setItems((previous) => [...previous, ...nextItems]);
      setHasMore(feed.hasMore);
      setNextPage(feed.nextPage);
    } catch {
      setError("Couldn't load more moments. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, nextPage, slug]);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadNext();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [loadNext]);

  const indexOf = useCallback(
    (item: GalleryItem) => items.indexOf(item),
    [items],
  );

  const openModal = useCallback((index: number) => {
    setOpenIndex(index);
  }, []);

  const handleReplaced = useCallback((itemId: string, url: string) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === itemId
          ? {
              ...item,
              src: url,
              isVideo: url.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i) !== null,
            }
          : item,
      ),
    );
  }, []);

  const addPhoto = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setAddError("Pick an image file");
      return;
    }
    setAdding(true);
    setAddError(undefined);
    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadBody = (await uploadRes.json()) as { data: { url: string } };

      const createRes = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadBody.data.url, caption: "" }),
        credentials: "include",
      });
      if (!createRes.ok) throw new Error("Couldn't add the photo");
      const created = (await createRes.json()) as { data: GalleryImage };
      const item = mapFeedEntry(created.data);
      if (item) {
        setItems((previous) => [item, ...previous]);
        setCount((previous) => previous + 1);
      }
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAdding(false);
    }
  }, []);

  const featured = useMemo(
    () => items.filter((item) => item.featured),
    [items],
  );
  const nonFeatured = useMemo(
    () => items.filter((item) => !item.featured),
    [items],
  );

  const skeletonAspects = [1.25, 0.8, 1.1, 0.75, 1.4, 0.9];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-4">
      <div className="mb-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setTheme((current) => pickRandomTheme(current))}
          className="border-white/10 bg-white/[0.03] hover:border-rose-400/30 hover:bg-white/[0.06] flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-white/60 backdrop-blur transition-colors"
        >
          <ShuffleIcon />
          Shuffle the look
        </button>
        <span className="text-xs text-white/35">{count.toLocaleString()} memories</span>
        {canAdd && (
          <>
            <button
              type="button"
              onClick={() => addInputRef.current?.click()}
              disabled={adding}
              className="border-white/10 bg-white/[0.03] hover:border-rose-400/30 hover:bg-white/[0.06] flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-white/60 backdrop-blur transition-colors disabled:opacity-50"
            >
              {adding ? (
                <span className="border-white/25 h-4 w-4 animate-spin rounded-full border-2 border-t-white" />
              ) : (
                <span aria-hidden>+</span>
              )}
              Add photo
            </button>
            <input
              ref={addInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void addPhoto(file);
              }}
            />
          </>
        )}
      </div>
      {addError && (
        <div className="mb-4 text-center">
          <p className="text-xs text-rose-400">{addError}</p>
        </div>
      )}

      <motion.div
        key={theme}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        {theme === "featured" ? (
          <>
            {featured.length > 0 && (
              <div className="mb-8">
                <FeaturedCarousel items={featured} indexOf={indexOf} onOpen={openModal} />
              </div>
            )}
            <MasonryGrid items={nonFeatured} onOpen={openModal} indexOf={indexOf} />
          </>
        ) : theme === "bento" ? (
          <BentoGrid items={items} onOpen={openModal} indexOf={indexOf} />
        ) : theme === "polaroid" ? (
          <PolaroidGrid items={items} onOpen={openModal} indexOf={indexOf} />
        ) : theme === "carousel" ? (
          <CarouselRows items={items} onOpen={openModal} indexOf={indexOf} />
        ) : theme === "grid" ? (
          <UniformGrid items={items} onOpen={openModal} indexOf={indexOf} />
        ) : (
          <MasonryGrid items={items} onOpen={openModal} indexOf={indexOf} />
        )}
      </motion.div>

      {loading && (
        <div aria-hidden className={`mt-3 ${themeSkeleton(theme)}`}>
          {Array.from({ length: 8 }).map((_, position) => (
            <SkeletonTile
              key={position}
              aspect={theme === "grid" ? 1 : skeletonAspects[position % skeletonAspects.length]}
              className="mb-3"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-8 text-center">
          <p className="text-sm text-white/60">{error}</p>
          <button
            type="button"
            onClick={() => void loadNext()}
            className="mt-3 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/85 transition-colors hover:bg-white/10"
          >
            Try again
          </button>
        </div>
      )}

      <div ref={sentinelRef} className="h-10" />

      {!hasMore && !loading && items.length > 0 && (
        <p className="text-white/50 pb-6 pt-2 text-center font-serif text-lg italic">
          That&apos;s every moment we&apos;ve kept — all {items.length.toLocaleString()} of them. ♥
        </p>
      )}

      <AnimatePresence>
        {openIndex !== null && (
          <GalleryModal
            key="gallery-modal"
            items={items}
            index={openIndex}
            onClose={() => setOpenIndex(null)}
            onIndex={setOpenIndex}
            onReplaced={handleReplaced}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
