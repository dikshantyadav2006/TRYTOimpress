"use client";

import { useState } from "react";

import type { Dream } from "@repo/shared";

import {
  DeleteButton,
  EmptyState,
  ListCard,
  LoadingState,
  PageHeader,
  ErrorState,
} from "@/components/crud";
import { Badge, SearchInput } from "@/components/ui";
import { BulkBar, SelectAllButton, SelectButton, bulkDelete, useBulkSelection } from "@/components/bulk";
import { ReorderList } from "@/components/reorder";
import { useToast } from "@/components/toast";
import { useData } from "@/lib/use-data";

export default function DreamsPage() {
  const { data: dreams, loading, error, reload } = useData<Dream>("/dreams");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...dreams]
    .filter((dream) =>
      needle
        ? dream.title.toLowerCase().includes(needle) ||
          dream.text.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => a.order - b.order);

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/dreams", [...bulk.selected]);
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
        title="Dreams"
        subtitle="The bucket list for the Our Future chapter."
        newHref="/dreams/new"
        newLabel="New dream"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />
      {!bulk.selecting && dreams.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search dreams…"
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
          title="No dreams yet"
          description="Add the first dream to the bucket list."
          href="/dreams/new"
          hrefLabel="Add dream"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((dream) => (
            <ListCard
              key={dream.id}
              title={dream.title}
              subtitle={dream.text}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  {dream.emoji && <Badge tone="rose">{dream.emoji}</Badge>}
                  <Badge tone="neutral">#{dream.order}</Badge>
                </div>
              }
              href={`/dreams/${dream.id}`}
              actions={<DeleteButton id={dream.id} path="/dreams" onDeleted={reload} />}
              selectable={bulk.selecting}
              selected={bulk.selected.has(dream.id)}
              onToggle={() => bulk.toggle(dream.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/dreams" items={sorted} onChanged={reload}>
          {(dream) => (
            <ListCard
              title={dream.title}
              subtitle={dream.text}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  {dream.emoji && <Badge tone="rose">{dream.emoji}</Badge>}
                  <Badge tone="neutral">#{dream.order}</Badge>
                </div>
              }
              href={`/dreams/${dream.id}`}
              actions={<DeleteButton id={dream.id} path="/dreams" onDeleted={reload} />}
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
