"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Heart, ImagePlus, Loader2, Sparkles, X } from "lucide-react";

import type { GalleryCategory } from "@repo/shared";

import { FormFooter, Label, SectionCard, SegmentedControl } from "@/components/ui";
import { useDirtyGuard } from "@/components/dirty-guard";
import { ApiError, post, uploadFile } from "@/lib/api";

const CATEGORY_OPTIONS: { value: GalleryCategory; label: string; icon: typeof Heart }[] = [
  { value: "moment", label: "Moment", icon: Sparkles },
  { value: "story", label: "Story", icon: BookOpen },
  { value: "favourite", label: "Favourite", icon: Heart },
];

interface Draft {
  key: string;
  url: string;
  caption: string;
  category: GalleryCategory;
}

const fileLabel = (file: File) =>
  file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();

const isImage = (url: string) => /\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i.test(url);

export function BulkUploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useDirtyGuard(drafts);

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(undefined);
    try {
      for (const file of Array.from(files)) {
        const { url } = await uploadFile(file);
        setDrafts((current) => [
          ...current,
          {
            key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            url,
            caption: fileLabel(file),
            category: "moment",
          },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const updateDraft = (key: string, patch: Partial<Draft>) => {
    setDrafts((current) => current.map((draft) => (draft.key === key ? { ...draft, ...patch } : draft)));
  };

  const removeDraft = (key: string) => {
    setDrafts((current) => current.filter((draft) => draft.key !== key));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (drafts.length === 0) {
      setError("Add at least one file first.");
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      for (const draft of drafts) {
        await post("/gallery", {
          caption: draft.caption || "Untitled moment",
          category: draft.category,
          featured: false,
          imageUrl: draft.url,
        });
      }
      router.push("/gallery");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-5">
      <SectionCard
        title="Add files"
        description="Pick as many images or videos as you like. They upload first, then you save them all at once."
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="border-dashed hover:border-rose-300/50 flex w-full flex-col items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] p-8 text-center transition-colors active:scale-[0.99] disabled:opacity-50"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(event) => void addFiles(event.target.files)}
          />
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
              <span className="text-sm text-white/60">Uploading…</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6 text-rose-400" />
              <span className="text-sm text-white/70">
                Tap to select files — {drafts.length} ready
              </span>
            </>
          )}
        </button>
      </SectionCard>

      {drafts.length > 0 && (
        <SectionCard title="Review" description="Give each one a caption before saving.">
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div
                key={draft.key}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
              >
                <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                  {isImage(draft.url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={draft.url} alt={draft.caption} className="h-full w-full object-cover" />
                  ) : (
                    <video src={draft.url} className="h-full w-full object-cover" muted />
                  )}
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <Label className="sr-only">Caption</Label>
                  <input
                    type="text"
                    value={draft.caption}
                    onChange={(event) => updateDraft(draft.key, { caption: event.target.value })}
                    className="bg-background focus:border-rose-300/60 w-full rounded-lg border border-white/15 px-3 py-2 text-sm text-white outline-none transition-colors"
                    placeholder="Caption"
                  />
                  <SegmentedControl
                    name="Category"
                    size="sm"
                    value={draft.category}
                    onChange={(category) => updateDraft(draft.key, { category })}
                    options={CATEGORY_OPTIONS}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeDraft(draft.key)}
                  aria-label="Remove"
                  className="text-muted-foreground hover:text-rose-300 rounded-lg p-2 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <FormFooter
        loading={saving}
        error={error}
        submitLabel={drafts.length > 0 ? `Save all ${drafts.length}` : "Save all"}
      />
    </form>
  );
}
