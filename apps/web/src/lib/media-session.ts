"use client";

import { useEffect, useState } from "react";

export interface ShareSessionInfo {
  role: "editor" | "viewer" | null;
  permissions: string[];
  slug?: string | null;
}

const NO_SESSION: ShareSessionInfo = { role: null, permissions: [], slug: null };

let cachedSession: ShareSessionInfo | undefined;
let inflight: Promise<ShareSessionInfo> | null = null;

export async function getShareSession(force = false): Promise<ShareSessionInfo> {
  if (cachedSession !== undefined && !force) return cachedSession;
  if (!force && inflight) return inflight;

  inflight = (async () => {
    let next: ShareSessionInfo = NO_SESSION;
    try {
      const res = await fetch("/api/share/session", {
        cache: "no-store",
        credentials: "include",
      });
      if (res.ok) {
        const body = (await res.json()) as { data?: ShareSessionInfo };
        next = body.data ?? NO_SESSION;
      }
    } catch {
      next = NO_SESSION;
    }
    cachedSession = next;
    return next;
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}

export function canEditImages(session: ShareSessionInfo): boolean {
  return session.role === "editor" || session.permissions.includes("images.edit");
}

export function canAddGallery(session: ShareSessionInfo): boolean {
  return session.role === "editor" || session.permissions.includes("gallery.add");
}

export function useShareSession(): {
  session: ShareSessionInfo;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [session, setSession] = useState<ShareSessionInfo>(NO_SESSION);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const next = await getShareSession(true);
    setSession(next);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    void getShareSession().then((next) => {
      if (!active) return;
      setSession(next);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { session, loading, refresh };
}
