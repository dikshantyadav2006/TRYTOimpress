"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center">
      <span aria-hidden className="text-6xl">
        💔
      </span>
      <h1 className="mt-6 font-display text-5xl">Something went wrong</h1>
      <p className="mt-3 max-w-sm text-white/60">
        The story couldn&apos;t be loaded right now. Give it a moment, then try again.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-linear-to-r from-pink-500 via-rose-500 to-red-500 px-8 py-3.5 text-base font-semibold text-white shadow-[0_10px_40px_-10px_rgba(244,63,94,0.9)] transition-all duration-200 hover:brightness-110 active:scale-95"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-sm text-white/40 transition-colors hover:text-white/70"
        >
          Back to the start
        </Link>
      </div>
    </div>
  );
}
