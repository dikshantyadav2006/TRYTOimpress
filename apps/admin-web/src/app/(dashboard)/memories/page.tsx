"use client";

import { useState } from "react";

import type { Memory } from "@repo/shared";

import {
  DeleteButton,
  EmptyState,
  ListCard,
  LoadingState,
  PageHeader,
  ErrorState,
} from "@/components/crud";
import { SearchInput } from "@/components/ui";
import { BulkBar, SelectAllButton, SelectButton, bulkDelete, useBulkSelection } from "@/components/bulk";
import { ReorderList } from "@/components/reorder";
import { useToast } from "@/components/toast";
import { useData } from "@/lib/use-data";

export default function MemoriesPage() {
  const { data: memories, loading, error, reload } = useData<Memory>("/memories");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...memories]
    .filter((memory) =>
      needle
        ? memory.title.toLowerCase().includes(needle) ||
          memory.caption.toLowerCase().includes(needle) ||
          memory.date.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/memories", [...bulk.selected]);
      bulk.clear();
      showToast("success", "Deleted");
      void reload();
    } catch {
      showToast("error", "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Memories"
        subtitle="The story timeline — titles, dates, captions & images."
        newHref="/memories/new"
        newLabel="New memory"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />
      {!bulk.selecting && memories.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search memories…"
          className="mb-4"
        />
      )}
      {bulk.selecting && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-sm">
            {bulk.selected.size} selected — tap cards to toggle
          </p>
          <SelectAllButton allSelected={bulk.allSelected} onToggle={bulk.toggleAll} />
        </div>
      )}
      {sorted.length === 0 ? (
        <EmptyState
          title="No memories yet"
          description="Add the first chapter of your story."
          href="/memories/new"
          hrefLabel="Add memory"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((memory) => {
            return (
              <ListCard
                key={memory.id}
                title={memory.title}
                subtitle={memory.date}
                thumbnail={memory.imageUrl || undefined}
                meta={<p className="text-muted-foreground line-clamp-2 text-sm">{memory.caption}</p>}
                href={`/memories/${memory.id}`}
                actions={<DeleteButton id={memory.id} path="/memories" onDeleted={reload} />}
                selectable={bulk.selecting}
                selected={bulk.selected.has(memory.id)}
                onToggle={() => bulk.toggle(memory.id)}
              />
            );
          })}
        </div>
      ) : (
        <ReorderList path="/memories" items={sorted} onChanged={reload}>
          {(memory) => (
            <ListCard
              title={memory.title}
              subtitle={memory.date}
              thumbnail={memory.imageUrl || undefined}
              meta={<p className="text-muted-foreground line-clamp-2 text-sm">{memory.caption}</p>}
              href={`/memories/${memory.id}`}
              actions={<DeleteButton id={memory.id} path="/memories" onDeleted={reload} />}
            />
          )}
        </ReorderList>
      )}

      {bulk.selecting && (
        <BulkBar
          count={bulk.selected.size}
          onClear={bulk.clear}
          onDelete={() => void onBulkDelete()}
          deleting={deleting}
        />
      )}
    </div>
  );
}
