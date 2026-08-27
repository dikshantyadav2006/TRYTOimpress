"use client";

import { useState } from "react";

import type { LovePromise } from "@repo/shared";

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

export default function PromisesPage() {
  const { data: promises, loading, error, reload } = useData<LovePromise>("/promises");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...promises]
    .filter((promise) =>
      needle
        ? promise.title.toLowerCase().includes(needle) ||
          promise.text.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => a.order - b.order);

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/promises", [...bulk.selected]);
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
        title="Promises"
        subtitle="The vows shown as flip cards."
        newHref="/promises/new"
        newLabel="New promise"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />
      {!bulk.selecting && promises.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search promises…"
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
          title="No promises yet"
          description="Write the first promise you want to keep forever."
          href="/promises/new"
          hrefLabel="Add promise"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((promise) => (
            <ListCard
              key={promise.id}
              title={promise.title}
              subtitle={promise.text}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  {promise.emoji && <Badge tone="rose">{promise.emoji}</Badge>}
                  <Badge tone="neutral">#{promise.order}</Badge>
                </div>
              }
              href={`/promises/${promise.id}`}
              actions={<DeleteButton id={promise.id} path="/promises" onDeleted={reload} />}
              selectable={bulk.selecting}
              selected={bulk.selected.has(promise.id)}
              onToggle={() => bulk.toggle(promise.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/promises" items={sorted} onChanged={reload}>
          {(promise) => (
            <ListCard
              title={promise.title}
              subtitle={promise.text}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  {promise.emoji && <Badge tone="rose">{promise.emoji}</Badge>}
                  <Badge tone="neutral">#{promise.order}</Badge>
                </div>
              }
              href={`/promises/${promise.id}`}
              actions={<DeleteButton id={promise.id} path="/promises" onDeleted={reload} />}
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
