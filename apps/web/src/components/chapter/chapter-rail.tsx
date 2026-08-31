"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@repo/ui";

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export interface ChapterRailItem {
  slug: string;
  title: string;
  href: string;
}

export interface ChapterRailProps {
  items: ChapterRailItem[];
}

export function ChapterRail({ items }: ChapterRailProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <>
      {/* Desktop rail (right side) */}
      <aside
        aria-label="Chapters"
        className="fixed right-4 top-1/2 z-30 hidden w-56 -translate-y-1/2 lg:block"
      >
        <nav className="border-white/10 bg-white/[0.03] max-h-[70svh] overflow-y-auto rounded-2xl border p-3 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <p className="text-rose-300/80 flex items-center gap-2 px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.25em]">
            <BookIcon className="h-3.5 w-3.5" />
            Chapters
          </p>
          <ul className="space-y-0.5">
            {items.map((item) => {
              const href = item.href;
              const active = pathname === href;
              return (
                <li key={item.slug}>
                  <Link
                    href={href}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-rose-500/15 text-rose-100"
                        : "text-white/60 hover:bg-white/5 hover:text-white/90",
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open chapters"
        className="bg-linear-to-r from-rose-500 to-pink-500 fixed bottom-6 right-4 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-semibold text-white shadow-[0_8px_32px_-12px_rgba(244,114,182,0.7)] ring-1 ring-white/20 ring-inset transition-transform active:scale-95 lg:hidden"
      >
        <BookIcon className="h-4 w-4" />
        Chapters
      </button>

      {/* Mobile bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close chapters"
            onClick={() => setOpen(false)}
            className="animate-fade-in bg-black/60 absolute inset-0"
          />
          <div className="bg-surface animate-sheet-up fixed inset-x-0 bottom-0 max-h-[80svh] overflow-y-auto rounded-t-3xl border-t border-white/10 p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-rose-300/80 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.25em]">
                <BookIcon className="h-3.5 w-3.5" />
                Chapters
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              {items.map((item) => {
                const href = item.href;
                const active = pathname === href;
                return (
                  <Link
                    key={item.slug}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-rose-500/15 text-rose-100"
                        : "text-foreground hover:bg-white/5",
                    )}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
