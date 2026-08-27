"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { uploadFile } from "@/lib/api";

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|avif|svg)$/i;

export function UploadField({
  value,
  onChange,
  accept = "image/*,video/*",
}: {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(undefined);
    try {
      const { url } = await uploadFile(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Upload a file"
        className="border-dashed hover:border-rose-300/50 flex w-full items-center gap-3 rounded-xl border border-white/15 bg-white/[0.03] p-3 text-left transition-colors active:scale-[0.99] disabled:opacity-50"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => void onPick(event.target.files?.[0])}
        />
        {value ? (
          <>
            <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
              {IMAGE_EXTENSIONS.test(value) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <video src={value} className="h-full w-full object-cover" muted />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-foreground block truncate text-sm font-medium">
                {IMAGE_EXTENSIONS.test(value) ? "Image uploaded" : "Video uploaded"}
              </span>
              <span className="text-muted-foreground block truncate text-xs">{value}</span>
            </span>
            <span
              role="button"
              tabIndex={-1}
              onClick={(event) => {
                event.stopPropagation();
                onChange("");
              }}
              className="text-muted-foreground hover:text-foreground rounded-lg p-2"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </span>
          </>
        ) : uploading ? (
          <span className="flex items-center gap-2 px-1 py-4 text-sm text-white/60">
            <Loader2 className="h-5 w-5 animate-spin" />
            Uploading…
          </span>
        ) : (
          <span className="flex items-center gap-2 px-1 py-4 text-sm text-white/60">
            <ImagePlus className="h-5 w-5" />
            Tap to upload an image or video
          </span>
        )}
      </button>
      {error && <p className="text-sm text-rose-400">{error}</p>}
    </div>
  );
}
