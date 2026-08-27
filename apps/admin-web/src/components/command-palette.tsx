"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { CornerDownLeft, Search } from "lucide-react";

import { cn } from "@repo/ui";

export interface CommandItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
}

export interface CommandGroup {
  id: string;
  label: string;
  items: CommandItem[];
}

export function CommandPalette({
  open,
  onClose,
  groups,
}: {
  open: boolean;
  onClose: () => void;
  groups: CommandGroup[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            !needle ||
            item.label.toLowerCase().includes(needle) ||
            (item.description ?? "").toLowerCase().includes(needle) ||
            item.href.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  const flat = useMemo(() => results.flatMap((group) => group.items), [results]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const run = (item: CommandItem) => {
    onClose();
    router.push(item.href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, flat.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = flat[active];
      if (item) run(item);
    }
  };

  const scrollActiveIntoView = (index: number) => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    el?.scrollIntoView({ block: "nearest" });
  };

  let itemIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        type="button"
        aria-label="Close palette"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className="animate-sheet-up relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl shadow-black/50">
        <div className="border-white/10 flex items-center gap-2.5 border-b px-4">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Type to search or create…"
            className="h-13 bg-transparent w-full py-4 text-sm text-foreground placeholder:text-white/30 outline-none"
          />
          <kbd className="border-white/10 bg-white/5 rounded-md border px-1.5 py-0.5 text-[10px] text-white/40">
            esc
          </kbd>
        </div>

        {flat.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-white/40">
            No results for “{query}”
          </div>
        ) : (
          <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
            {results.map((group) => (
              <div key={group.id} className="mb-1">
                <p className="text-muted-foreground/70 px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  itemIndex += 1;
                  const index = itemIndex;
                  const selected = index === active;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-index={index}
                      data-active={selected}
                      onMouseEnter={() => {
                        setActive(index);
                        scrollActiveIntoView(index);
                      }}
                      onClick={() => run(item)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                        selected ? "bg-rose-500/15 text-rose-100" : "hover:bg-white/5",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          selected ? "bg-rose-500/20 text-rose-200" : "bg-white/5 text-white/60",
                        )}
                      >
                        {Icon ? <Icon className="h-4 w-4" /> : <CornerDownLeft className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-foreground block truncate text-sm font-medium">
                          {item.label}
                        </span>
                        {item.description && (
                          <span className="text-muted-foreground block truncate text-xs">
                            {item.description}
                          </span>
                        )}
                      </span>
                      <kbd className="text-muted-foreground/60 hidden text-[10px] sm:block">
                        ↵
                      </kbd>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
