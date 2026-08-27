"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks whether a form differs from its initial (pristine) snapshot and, when
 * dirty, blocks tab close/refresh and in-app link navigation until the user
 * confirms. Returns the current `dirty` boolean.
 */
export function useDirtyGuard<T>(
  current: T,
  options?: { enabled?: boolean; resetKey?: unknown },
): boolean {
  const { enabled = true, resetKey } = options ?? {};
  const pristine = useRef(current);
  const dirty = JSON.stringify(current) !== JSON.stringify(pristine.current);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  useEffect(() => {
    pristine.current = current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    if (!enabled) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!dirtyRef.current) return;
      const target = (event.target as HTMLElement | null)?.closest?.("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }
      const leave = window.confirm("You have unsaved changes. Leave without saving?");
      if (!leave) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClickCapture, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClickCapture, true);
    };
  }, [enabled]);

  return dirty;
}
