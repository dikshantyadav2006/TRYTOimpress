"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";

import { vibrate } from "@repo/ui";

import type { GalleryItem } from "./types";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const TINTS = [
  "bg-rose-500/[0.07]",
  "bg-pink-500/[0.06]",
  "bg-rose-400/[0.05]",
  "bg-pink-400/[0.05]",
] as const;

export function tintFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return TINTS[hash % TINTS.length]!;
}

export function aspectFor(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 37 + id.charCodeAt(i)) >>> 0;
  }
  const options = [1, 1, 0.75, 0.8, 1.25, 1.4, 0.9, 1.1];
  return options[hash % options.length]!;
}

export function Media({
  item,
  className,
}: {
  item: GalleryItem;
  className?: string;
}) {
  if (item.isVideo) {
    return (
      <video
        src={item.src}
        muted
        loop
        playsInline
        preload="metadata"
        className={className ?? "h-full w-full object-contain"}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- gallery is dynamic media from DB
    <img
      src={item.src}
      alt={item.alt}
      loading="lazy"
      decoding="async"
      className={className ?? "h-full w-full object-contain"}
    />
  );
}

export function SkeletonTile({
  aspect,
  className = "",
}: {
  aspect?: number | undefined;
  className?: string | undefined;
}) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-2xl bg-white/[0.06] ${className}`}
      style={aspect ? { aspectRatio: String(aspect) } : undefined}
    />
  );
}

function CaptionOverlay({ item }: { item: GalleryItem }) {
  if (!item.caption) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/20 to-transparent p-4 pt-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    >
      <p className="text-sm text-white/95">{item.caption}</p>
    </div>
  );
}

function CategoryChip({ category }: { category?: string | undefined }) {
  if (!category) return null;
  return (
    <span className="bg-white/15 absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-md">
      {category}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Masonry (Pinterest)                                                 */
/* ------------------------------------------------------------------ */

export function MasonryGrid({
  items,
  onOpen,
  indexOf,
}: {
  items: GalleryItem[];
  onOpen: (index: number) => void;
  indexOf: (item: GalleryItem) => number;
}) {
  return (
    <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
      {items.map((item, position) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            onOpen(indexOf(item));
            vibrate(6);
          }}
          className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-surface text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          {item.isVideo ? (
            <video
              src={item.src}
              muted
              loop
              playsInline
              preload="metadata"
              className="max-h-[75vh] w-full object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- gallery media
            <img
              src={item.src}
              alt={item.alt}
              loading="lazy"
              decoding="async"
              style={{ transitionDelay: `${(position % 4) * 60}ms` }}
              className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
            />
          )}
          <CategoryChip category={item.category} />
          <CaptionOverlay item={item} />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bento                                                               */
/* ------------------------------------------------------------------ */

function bentoSpan(position: number): string {
  const pattern = [
    "col-span-2 row-span-2",
    "row-span-1",
    "row-span-2",
    "row-span-1",
    "row-span-1",
    "row-span-1",
    "col-span-2 row-span-1",
    "row-span-2",
  ];
  return pattern[position % pattern.length]!;
}

export function BentoGrid({
  items,
  onOpen,
  indexOf,
}: {
  items: GalleryItem[];
  onOpen: (index: number) => void;
  indexOf: (item: GalleryItem) => number;
}) {
  return (
    <div className="grid grid-flow-dense grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item, position) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            onOpen(indexOf(item));
            vibrate(6);
          }}
          className={`group relative overflow-hidden rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${tintFor(item.id)} ${bentoSpan(position)} min-h-24`}
        >
          <Media item={item} className="absolute inset-0 h-full w-full object-contain p-1.5" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CategoryChip category={item.category} />
          <CaptionOverlay item={item} />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Uniform grid                                                        */
/* ------------------------------------------------------------------ */

export function UniformGrid({
  items,
  onOpen,
  indexOf,
}: {
  items: GalleryItem[];
  onOpen: (index: number) => void;
  indexOf: (item: GalleryItem) => number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            onOpen(indexOf(item));
            vibrate(6);
          }}
          className={`group relative aspect-square overflow-hidden rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${tintFor(item.id)}`}
        >
          <Media item={item} className="absolute inset-0 h-full w-full object-contain p-2" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CategoryChip category={item.category} />
          <CaptionOverlay item={item} />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Polaroid                                                            */
/* ------------------------------------------------------------------ */

export function PolaroidGrid({
  items,
  onOpen,
  indexOf,
}: {
  items: GalleryItem[];
  onOpen: (index: number) => void;
  indexOf: (item: GalleryItem) => number;
}) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item, position) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            onOpen(indexOf(item));
            vibrate(6);
          }}
          style={{
            transform: position % 2 === 0 ? "rotate(-1.4deg)" : "rotate(1.4deg)",
            transitionProperty: "transform, box-shadow",
            transitionDuration: "400ms",
            transitionTimingFunction: EASE.join(","),
          }}
          className="group flex flex-col rounded-md bg-white p-3 pb-4 text-left shadow-xl shadow-black/40 hover:rotate-0 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          <span className="relative block w-full overflow-hidden rounded-sm bg-neutral-200">
            {item.isVideo ? (
              <video
                src={item.src}
                muted
                loop
                playsInline
                preload="metadata"
                className="max-h-[70vh] w-full object-contain"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- gallery media
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
              />
            )}
          </span>
          <span className="mt-2 line-clamp-2 font-serif text-sm italic text-neutral-800">
            {item.caption || "♥"}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Carousel rows (grouped by category)                                 */
/* ------------------------------------------------------------------ */

export function CarouselRows({
  items,
  onOpen,
  indexOf,
}: {
  items: GalleryItem[];
  onOpen: (index: number) => void;
  indexOf: (item: GalleryItem) => number;
}) {
  const groups = useMemo(() => {
    const byCategory = new Map<string, GalleryItem[]>();
    for (const item of items) {
      const key = item.category ?? "moments";
      const group = byCategory.get(key) ?? [];
      group.push(item);
      byCategory.set(key, group);
    }
    return [...byCategory.entries()];
  }, [items]);

  return (
    <div className="space-y-8">
      {groups.map(([category, group]) => (
        <section key={category}>
          <h2 className="mb-3 px-1 font-serif text-xl capitalize text-white/80">{category}</h2>
          <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
            {group.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onOpen(indexOf(item));
                  vibrate(6);
                }}
                className={`group relative h-56 w-64 shrink-0 snap-center overflow-hidden rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 sm:h-72 sm:w-80 ${tintFor(item.id)}`}
              >
                <Media item={item} className="absolute inset-0 h-full w-full object-contain p-2" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CategoryChip category={item.category} />
                <CaptionOverlay item={item} />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Featured carousel                                                   */
/* ------------------------------------------------------------------ */

export function FeaturedCarousel({
  items,
  indexOf,
  onOpen,
}: {
  items: GalleryItem[];
  indexOf: (item: GalleryItem) => number;
  onOpen: (index: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const scrollTo = useCallback(
    (position: number) => {
      const track = trackRef.current;
      const target = track?.children[position];
      if (track && target) {
        track.scrollTo({ left: (target as HTMLElement).offsetLeft - track.offsetLeft, behavior: "smooth" });
        setActive(position);
      }
    },
    [],
  );

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % items.length;
        scrollTo(next);
        return next;
      });
    }, 4200);
    return () => window.clearInterval(id);
  }, [paused, items.length, scrollTo]);

  if (items.length === 0) return null;

  return (
    <section
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1"
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onOpen(indexOf(item));
              vibrate(6);
            }}
            className="group relative h-[58vh] min-h-72 w-[85%] shrink-0 snap-center overflow-hidden rounded-3xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 sm:w-[62%] lg:w-[48%]"
            style={{
              backgroundImage:
                "linear-gradient(160deg, rgba(244,114,182,0.1), rgba(244,114,182,0.03)), linear-gradient(to bottom, #17131c, #120f16)",
            }}
          >
            <Media item={item} className="absolute inset-0 m-auto max-h-full max-w-full object-contain p-4" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-5 pt-14 text-left">
              <p className="font-serif text-xl text-white/95 sm:text-2xl">
                {item.caption || "A moment we keep"}
              </p>
              {item.category && (
                <span className="mt-1 inline-block rounded-full bg-pink-500/30 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-pink-100">
                  {item.category}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous featured moment"
            onClick={() => scrollTo((active - 1 + items.length) % items.length)}
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-lg text-white backdrop-blur-md transition-transform hover:scale-105 active:scale-90"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next featured moment"
            onClick={() => scrollTo((active + 1) % items.length)}
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-lg text-white backdrop-blur-md transition-transform hover:scale-105 active:scale-90"
          >
            →
          </button>
          <div className="mt-4 flex justify-center gap-2">
            {items.map((item, position) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to featured moment ${position + 1}`}
                onClick={() => scrollTo(position)}
                className={`h-2 rounded-full transition-all ${
                  position === active ? "w-6 bg-pink-400" : "w-2 bg-white/25"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
