"use client";

import { useState } from "react";
import { CheckSquare, Loader2, Square, Trash2, X } from "lucide-react";

import { cn } from "@repo/ui";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { del } from "@/lib/api";

export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const clear = () => setSelected(new Set());

  const begin = () => {
    setSelecting(true);
    setSelected(new Set());
  };

  const cancel = () => {
    setSelecting(false);
    setSelected(new Set());
  };

  const allSelected = items.length > 0 && items.every((item) => selected.has(item.id));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(items.map((item) => item.id)));

  return { selecting, selected, toggle, clear, begin, cancel, allSelected, toggleAll };
}

export function BulkBar({
  count,
  label = "selected",
  onClear,
  onDelete,
  deleting,
  children,
}: {
  count: number;
  label?: string;
  onClear: () => void;
  onDelete: () => void;
  deleting?: boolean;
  children?: React.ReactNode;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 bottom-16 z-40 flex justify-center px-4 md:bottom-4">
        <div className="animate-sheet-up border-white/15 bg-surface/95 w-full max-w-2xl rounded-2xl border p-3 shadow-2xl shadow-black/50 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-foreground min-w-16 text-sm font-semibold">
              {count} {label}
            </span>
            {children}
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={deleting || count === 0}
                className="hover:bg-rose-500/15 text-rose-300 inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors disabled:opacity-40"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
              <button
                type="button"
                onClick={onClear}
                aria-label="Clear selection"
                className="text-muted-foreground hover:text-foreground rounded-lg p-2 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {confirming && (
        <ConfirmDialog
          title={`Delete ${count} ${label}?`}
          message="This can't be undone."
          confirmLabel="Delete all"
          loading={Boolean(deleting)}
          onCancel={() => setConfirming(false)}
          onConfirm={() => onDelete()}
        />
      )}
    </>
  );
}

export function SelectButton({
  selecting,
  onToggle,
  className,
}: {
  selecting: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors",
        selecting
          ? "border-rose-300/50 bg-rose-500/15 text-rose-200"
          : "border-white/15 bg-white/5 text-white/85 hover:bg-white/10",
        className,
      )}
    >
      {selecting ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
      {selecting ? "Done" : "Select"}
    </button>
  );
}

export function SelectAllButton({
  allSelected,
  onToggle,
  disabled,
}: {
  allSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className="text-muted-foreground hover:text-foreground inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors disabled:opacity-40"
    >
      {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
      {allSelected ? "Deselect all" : "Select all"}
    </button>
  );
}

export async function bulkDelete(path: string, ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => del(`${path}/${id}`)));
}
