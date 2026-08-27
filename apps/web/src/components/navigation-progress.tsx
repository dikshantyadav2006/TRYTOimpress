"use client";

import { useNavigationStore } from "@repo/ui";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const start = useNavigationStore((state) => state.start);
  const done = useNavigationStore((state) => state.done);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    start();
  }, [pathname, searchParams, start]);

  useEffect(() => {
    done();
  }, [done]);

  return null;
}
