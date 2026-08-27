"use client";

import { useRef, useState } from "react";
import { GripVertical, Loader2 } from "lucide-react";

import { cn } from "@repo/ui";

import { put } from "@/lib/api";

export async function persistOrder(path: string, ordered: { id: string }[]): Promise<void> {
  await Promise.all(ordered.map((item, index) => put(`${path}/${item.id}`, { order: index + 1 })));
}

export function ReorderList<T extends { id: string }>({
  path,
  items,
  onChanged,
  children,
}: {
  path: string;
  items: T[];
  onChanged?: () => void;
  children: (item: T) => React.ReactNode;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const dragIndexRef = useRef(-1);

  const onDrop = (targetId: string) => {
    const from = dragIndexRef.current;
    const to = items.findIndex((item) => item.id === targetId);
    setDragId(null);
    setOverId(null);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    setSaving(true);
    void persistOrder(path, next)
      .then(() => onChanged?.())
      .finally(() => setSaving(false));
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOver = overId === item.id && dragId !== item.id;
        return (
          <div
            key={item.id}
            className={cn("relative", dragId === item.id && "opacity-40")}
            onDragOver={(event) => {
              event.preventDefault();
              setOverId(item.id);
            }}
            onDrop={(event) => {
              event.preventDefault();
              onDrop(item.id);
            }}
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-y-1 left-0 z-10 w-0.5 rounded-full bg-rose-400 transition-opacity",
                isOver ? "opacity-100" : "opacity-0",
              )}
            />
            <div className="flex items-start gap-1">
              <span
                role="button"
                tabIndex={0}
                draggable
                aria-label="Drag to reorder"
                onDragStart={(event) => {
                  dragIndexRef.current = index;
                  setDragId(item.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
                className="text-muted-foreground/40 hover:text-foreground mt-3.5 shrink-0 cursor-grab rounded-lg px-1.5 py-1 outline-none transition-colors active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">{children(item)}</div>
            </div>
          </div>
        );
      })}
      {saving && (
        <p className="text-muted-foreground inline-flex items-center gap-2 text-xs">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Saving order…
        </p>
      )}
    </div>
  );
}
