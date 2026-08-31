"use client";

import { useRef, useState } from "react";
import {
  Check,
  CheckSquare,
  Copy,
  GripVertical,
  Loader2,
  RefreshCw,
  Square,
  Star,
  Tag,
  Trash2,
  Type,
  X,
} from "lucide-react";

import type { GalleryCategory, GalleryImage } from "@repo/shared";
import { cn } from "@repo/ui";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { persistOrder } from "@/components/reorder";
import { Spinner } from "@/components/ui";
import { useToast } from "@/components/toast";
import { del, post, put, uploadFile } from "@/lib/api";
import { friendlyError } from "@/lib/errors";

const CATEGORIES: { value: GalleryCategory; label: string; className: string }[] = [
  { value: "moment", label: "Moment", className: "bg-sky-500/90" },
  { value: "story", label: "Story", className: "bg-violet-500/90" },
  { value: "favourite", label: "Favourite", className: "bg-rose-500/90" },
];

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|avif|svg)$/i;

function categoryClasses(category: GalleryCategory): string {
  return CATEGORIES.find((c) => c.value === category)?.className ?? "bg-white/20";
}

function isVideo(url: string): boolean {
  return !IMAGE_EXTENSIONS.test(url);
}

function TileMedia({ url, caption }: { url?: string | undefined; caption: string }) {
  if (!url) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-white/5 text-xs text-white/30">
        No media
      </div>
    );
  }
  if (isVideo(url)) {
    return (
      <video
        src={url}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-contain"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- gallery media is dynamic from DB
    <img src={url} alt={caption || "gallery item"} loading="lazy" className="h-full w-full object-cover" />
  );
}

export function GalleryGrid({
  images,
  view,
  onChanged,
  selecting,
  selected,
  onToggle,
}: {
  images: GalleryImage[];
  view: "grid" | "list";
  onChanged: () => void;
  selecting?: boolean;
  selected?: ReadonlySet<string>;
  onToggle?: (id: string) => void;
}) {
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<GalleryImage | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const replaceTargetRef = useRef<string | null>(null);

  const dragIdRef = useRef<string | null>(null);
  const dragIndexRef = useRef(-1);
  const [overId, setOverId] = useState<string | null>(null);

  const setBusyFlag = (id: string) => setBusy((s) => new Set(s).add(id));
  const clearBusyFlag = (id: string) =>
    setBusy((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });

  const toggleExpanded = (id: string) =>
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const patch = async (image: GalleryImage, body: Record<string, unknown>) => {
    setBusyFlag(image.id);
    try {
      await put(`/gallery/${image.id}`, body);
      showToast("success", "Saved");
      onChanged();
    } catch (err) {
      showToast("error", friendlyError(err).message);
    } finally {
      clearBusyFlag(image.id);
    }
  };

  const setCategory = (image: GalleryImage, category: GalleryCategory) => {
    if (category === image.category) return;
    void patch(image, { category });
  };

  const toggleFeatured = (image: GalleryImage) => {
    void patch(image, { featured: !image.featured });
  };

  const saveCaption = async (image: GalleryImage) => {
    const draft = (drafts[image.id] ?? image.caption).trim();
    if (!draft) return;
    await patch(image, { caption: draft });
    setDrafts((s) => {
      const next = { ...s };
      delete next[image.id];
      return next;
    });
    setExpanded((s) => {
      const next = new Set(s);
      next.delete(image.id);
      return next;
    });
  };

  const remove = async (image: GalleryImage) => {
    setBusyFlag(image.id);
    try {
      await del(`/gallery/${image.id}`);
      showToast("success", "Deleted");
      onChanged();
    } catch (err) {
      showToast("error", friendlyError(err).message);
    } finally {
      clearBusyFlag(image.id);
      setConfirmDelete(null);
    }
  };

  const duplicate = async (image: GalleryImage) => {
    setBusyFlag(image.id);
    try {
      const maxOrder = images.reduce((m, i) => Math.max(m, i.order ?? 0), 0);
      await post("/gallery", {
        caption: image.caption,
        category: image.category,
        featured: image.featured,
        ...(image.imageUrl ? { imageUrl: image.imageUrl } : {}),
        order: maxOrder + 1,
      });
      showToast("success", "Duplicated");
      onChanged();
    } catch (err) {
      showToast("error", friendlyError(err).message);
    } finally {
      clearBusyFlag(image.id);
    }
  };

  const replace = async (image: GalleryImage, file: File | undefined) => {
    if (!file) return;
    setReplacingId(image.id);
    try {
      const { url } = await uploadFile(file);
      await put(`/gallery/${image.id}`, { imageUrl: url });
      showToast("success", "Replaced");
      onChanged();
    } catch (err) {
      showToast("error", friendlyError(err).message);
    } finally {
      setReplacingId(null);
    }
  };

  const onDrop = (targetId: string) => {
    const from = dragIndexRef.current;
    const targetIndex = images.findIndex((i) => i.id === targetId);
    setOverId(null);
    if (from < 0 || targetIndex < 0 || from === targetIndex) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(targetIndex, 0, moved);
    void persistOrder("/gallery", next)
      .then(() => {
        showToast("success", "Order saved");
        onChanged();
      })
      .catch(() => showToast("error", "Could not save order"));
  };

  const renderControls = (image: GalleryImage) => {
    const saving = busy.has(image.id);
    const isReplacing = replacingId === image.id;
    return (
      <>
        <button
          type="button"
          onClick={() => setOpenCategory(openCategory === image.id ? null : image.id)}
          aria-label="Change category"
          title="Change category"
          className="glass flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/90 hover:text-black"
        >
          <Tag className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setConfirmDelete(image)}
          disabled={saving}
          aria-label="Delete"
          title="Delete"
          className="glass hover:bg-rose-500/90 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors disabled:opacity-50"
        >
          {saving ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={() => duplicate(image)}
          disabled={saving}
          aria-label="Duplicate"
          title="Duplicate (same settings)"
          className="glass hover:bg-white/90 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:text-black disabled:opacity-50"
        >
          <Copy className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            replaceTargetRef.current = image.id;
            replaceInputRef.current?.click();
          }}
          disabled={saving || isReplacing}
          aria-label="Replace media"
          title="Replace photo or video"
          className="glass hover:bg-white/90 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:text-black disabled:opacity-50"
        >
          {isReplacing ? <Spinner className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={() => toggleExpanded(image.id)}
          aria-label="Edit caption"
          title="Edit caption"
          className={cn(
            "glass flex h-9 w-9 items-center justify-center rounded-full transition-colors",
            expanded.has(image.id)
              ? "bg-white text-black"
              : "hover:bg-white/90 text-white hover:text-black",
          )}
        >
          <Type className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => toggleFeatured(image)}
          disabled={saving}
          aria-label={image.featured ? "Unfeature" : "Feature"}
          title={image.featured ? "Featured" : "Mark as featured"}
          className={cn(
            "glass flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-50",
            image.featured
              ? "bg-amber-400 text-black"
              : "hover:bg-amber-400/90 text-white hover:text-black",
          )}
        >
          <Star className={cn("h-4 w-4", image.featured && "fill-current")} />
        </button>
      </>
    );
  };

  const renderTile = (image: GalleryImage, index: number) => {
    const saving = busy.has(image.id);
    const isExpanded = expanded.has(image.id);
    const draft = drafts[image.id];
    const initDrag = (event: React.DragEvent) => {
      dragIndexRef.current = index;
      dragIdRef.current = image.id;
      event.dataTransfer.effectAllowed = "move";
    };

    const selectMode = Boolean(selecting && selected && onToggle);

    const body = (
      <>
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-2xl border border-white/10 bg-surface",
            view === "grid" ? "break-inside-avoid" : "flex items-center gap-4 p-3",
          )}
        >
          <div
            className={cn(
              "relative overflow-hidden",
              view === "grid" ? "aspect-[4/3] w-full" : "h-20 w-20 shrink-0 rounded-xl",
            )}
          >
            <TileMedia url={image.imageUrl} caption={image.caption} />
            {!selectMode && (
              <button
                type="button"
                onClick={() => setOpenCategory(openCategory === image.id ? null : image.id)}
                title="Change category"
                className={cn(
                  "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow transition-opacity",
                  categoryClasses(image.category),
                  openCategory === image.id ? "opacity-0" : "opacity-100",
                )}
              >
                {image.category}
              </button>
            )}
            {!selectMode && image.featured && (
              <span className="absolute right-2 top-2 rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-black shadow">
                ★
              </span>
            )}
          </div>

          {view === "list" && (
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate font-medium">
                {image.caption || "Untitled"}
              </p>
              <p className="text-muted-foreground mt-0.5 text-sm">#{index + 1}</p>
            </div>
          )}

          {!selectMode && (
            <div
              className={cn(
                "absolute right-2 bottom-2 left-2 z-10 flex items-center gap-1.5 p-1",
                view === "grid" ? "opacity-0 transition-opacity duration-200 group-hover:opacity-100" : "static",
              )}
            >
              {view === "grid" && (
                <span
                  draggable
                  role="button"
                  aria-label="Drag to reorder"
                  title="Drag to reorder"
                  onDragStart={(event) => {
                    initDrag(event);
                    event.dataTransfer.setData("text/plain", image.id);
                  }}
                  onDragEnd={() => {
                    dragIdRef.current = null;
                    setOverId(null);
                  }}
                  className="glass hover:bg-white/90 flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-white active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4" />
                </span>
              )}
              {renderControls(image)}
            </div>
          )}
          {selectMode && (
            <button
              type="button"
              onClick={() => onToggle?.(image.id)}
              aria-label={selected?.has(image.id) ? "Deselect" : "Select"}
              className={cn(
                "absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow transition-colors",
                selected?.has(image.id)
                  ? "bg-rose-500 text-white"
                  : "glass text-white hover:bg-white/90 hover:text-black",
              )}
            >
              {selected?.has(image.id) ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {openCategory === image.id && (
          <div className="animate-sheet-up z-30 mt-2 flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/95 p-1.5 shadow-xl">
            {CATEGORIES.map((category) => {
              const active = category.value === image.category;
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => {
                    setCategory(image, category.value);
                    setOpenCategory(null);
                  }}
                  className={cn(
                    "rounded-xl px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-all",
                    active
                      ? cn(category.className, "text-white shadow")
                      : "text-black/60 hover:bg-black/5",
                  )}
                >
                  {active && <Check className="mr-1 inline h-3 w-3" />}
                  {category.label}
                </button>
              );
            })}
          </div>
        )}

        {isExpanded && (
          <div className="animate-sheet-up z-20 mt-2 rounded-2xl border border-white/15 bg-white/95 p-3 text-black shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider">Edit caption</span>
              <button
                type="button"
                onClick={() => toggleExpanded(image.id)}
                aria-label="Close caption editor"
                className="rounded-lg p-1 transition-colors hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              autoFocus
              value={draft ?? image.caption}
              onChange={(event) => setDrafts((s) => ({ ...s, [image.id]: event.target.value }))}
              onKeyDown={(event) => {
                if (event.key === "Enter") void saveCaption(image);
                if (event.key === "Escape") toggleExpanded(image.id);
              }}
              placeholder="Add a caption…"
              className="mb-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDrafts((s) => {
                  const next = { ...s };
                  delete next[image.id];
                  return next;
                })}
                className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveCaption(image)}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Save
              </button>
            </div>
          </div>
        )}
      </>
    );

    const isOver = overId === image.id && dragIdRef.current !== image.id;

    return (
      <div
        key={image.id}
        draggable={!selectMode}
        onClick={selectMode ? () => onToggle?.(image.id) : undefined}
        onDragOver={(event) => {
          if (selectMode) return;
          event.preventDefault();
          if (dragIdRef.current !== image.id) setOverId(image.id);
        }}
        onDrop={(event) => {
          if (selectMode) return;
          event.preventDefault();
          onDrop(image.id);
        }}
        role={selectMode ? "button" : undefined}
        className={cn(
          "group relative",
          view === "grid" ? "mb-4" : "mb-3",
          selectMode && "cursor-pointer",
          isOver && "ring-2 ring-rose-400 ring-offset-2 ring-offset-black",
          overId === image.id && "opacity-90",
        )}
      >
        {body}
      </div>
    );
  };

  return (
    <div>
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(event) => {
          const id = replaceTargetRef.current;
          replaceTargetRef.current = null;
          const target = id ? images.find((i) => i.id === id) : undefined;
          if (target) void replace(target, event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {view === "grid" ? (
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5">
          {images.map((image, index) => renderTile(image, index))}
        </div>
      ) : (
        <div>{images.map((image, index) => renderTile(image, index))}</div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this item?"
          message="This can't be undone."
          loading={busy.has(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => void remove(confirmDelete)}
        />
      )}
    </div>
  );
}
