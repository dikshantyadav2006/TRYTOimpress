"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { PageBlock } from "@repo/shared";
import { cn } from "@repo/ui";

import {
  canEditImages,
  getShareSession,
  type ShareSessionInfo,
} from "@/lib/media-session";

export type EditableTarget =
  | { type: "hero" }
  | { type: "memory"; id: string }
  | { type: "gallery"; id: string }
  | { type: "page"; id: string }
  | { type: "page-block"; pageId: string; blocks: PageBlock[]; index: number };

export interface EditableImageProps {
  src: string;
  target: EditableTarget;
  children: React.ReactNode;
  className?: string;
  onReplaced?: (url: string) => void;
  allowVideo?: boolean;
  label?: string;
}

const NO_SESSION: ShareSessionInfo = { role: null, permissions: [] };

async function patchJson(path: string, body: unknown): Promise<boolean> {
  const res = await fetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return res.ok;
}

async function applyTarget(target: EditableTarget, url: string): Promise<boolean> {
  switch (target.type) {
    case "hero":
      return patchJson("/api/settings", { landing: { heroImageUrl: url } });
    case "memory":
      return patchJson(`/api/memories/${target.id}`, { imageUrl: url });
    case "gallery":
      return patchJson(`/api/gallery/${target.id}`, { imageUrl: url });
    case "page":
      return patchJson(`/api/pages/${target.id}`, { heroImageUrl: url });
    case "page-block": {
      const blocks = target.blocks.map((block, index) =>
        index === target.index ? { ...block, imageUrl: url } : block,
      );
      return patchJson(`/api/pages/${target.pageId}`, { blocks });
    }
  }
}

function ReplaceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

export function EditableImage({
  target,
  children,
  className,
  onReplaced,
  allowVideo = false,
  label,
}: EditableImageProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState<ShareSessionInfo>(NO_SESSION);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    void getShareSession().then((info) => {
      if (!active) return;
      setSession(info);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const runReplace = useCallback(
    async (file: File) => {
      if (allowVideo ? !/^(image|video)\//.test(file.type) : !file.type.startsWith("image/")) {
        setError(allowVideo ? "Pick an image or video file" : "Pick an image file");
        return;
      }
      setBusy(true);
      setError(undefined);
      try {
        const form = new FormData();
        form.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: form,
          credentials: "include",
        });
        if (!uploadRes.ok) {
          let message = "Upload failed";
          try {
            const body = (await uploadRes.json()) as { error?: string };
            message = body.error ?? message;
          } catch {
            // ignore
          }
          throw new Error(message);
        }
        const uploadBody = (await uploadRes.json()) as { data: { url: string } };
        const url = uploadBody.data.url;

        const applied = await applyTarget(target, url);
        if (!applied) throw new Error("Couldn't update this image");

        onReplaced?.(url);
        setSwapped(true);
        router.refresh();
        window.setTimeout(() => setSwapped(false), 2200);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setBusy(false);
      }
    },
    [target, onReplaced, allowVideo, router],
  );

  if (!ready || !canEditImages(session)) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", className)}>
      {children}

      {busy && (
        <div className="bg-black/45 absolute inset-0 z-20 flex items-center justify-center rounded-2xl">
          <span className="border-white/25 h-6 w-6 animate-spin rounded-full border-2 border-t-white" />
        </div>
      )}

      {!busy && swapped && (
        <div className="bg-emerald-600/95 absolute inset-x-0 bottom-2 z-20 mx-auto w-fit rounded-full px-3 py-1 text-xs font-medium text-white shadow-lg">
          Image updated ♥
        </div>
      )}

      {!busy && error && (
        <div className="bg-rose-600/95 absolute inset-x-0 bottom-2 z-20 mx-auto w-fit rounded-full px-3 py-1 text-xs font-medium text-white shadow-lg">
          {error}
        </div>
      )}

      <button
        type="button"
        aria-label={label ?? "Replace image"}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="focus-visible:ring-rose-400 border-white/20 hover:bg-black/75 absolute right-2 top-2 z-20 flex items-center gap-1.5 rounded-full border bg-black/50 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md transition-colors focus-visible:ring-2 disabled:opacity-50"
      >
        <ReplaceIcon />
        Replace
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={allowVideo ? "image/*,video/*" : "image/*"}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void runReplace(file);
        }}
      />
    </div>
  );
}
