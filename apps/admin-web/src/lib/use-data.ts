"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError, get } from "@/lib/api";

export function useData<T>(path: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const body = await get<{ data: T[] }>(path);
      setData(body.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [path]);

  const reloadSilently = useCallback(async () => {
    setError(undefined);
    try {
      const body = await get<{ data: T[] }>(path);
      setData(body.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load");
    }
  }, [path]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload, reloadSilently };
}
