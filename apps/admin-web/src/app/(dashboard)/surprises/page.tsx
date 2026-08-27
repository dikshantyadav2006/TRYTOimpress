"use client";

import { useState } from "react";

import type { Surprise } from "@repo/shared";

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

export default function SurprisesPage() {
  const { data: surprises, loading, error, reload } = useData<Surprise>("/surprises");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...surprises]
    .filter((surprise) =>
      needle
        ? surprise.title.toLowerCase().includes(needle) ||
          surprise.message.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => a.order - b.order);

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/surprises", [...bulk.selected]);
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
        title="Surprises"
        subtitle="Used by the scratch cards and the surprise button."
        newHref="/surprises/new"
        newLabel="New surprise"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />
      {!bulk.selecting && surprises.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search surprises…"
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
          title="No surprises yet"
          description="Hide the first little surprise."
          href="/surprises/new"
          hrefLabel="Add surprise"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((surprise) => (
            <ListCard
              key={surprise.id}
              title={surprise.title}
              subtitle={surprise.message}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  {surprise.emoji && <Badge tone="rose">{surprise.emoji}</Badge>}
                  <Badge tone="neutral">#{surprise.order}</Badge>
                </div>
              }
              href={`/surprises/${surprise.id}`}
              actions={<DeleteButton id={surprise.id} path="/surprises" onDeleted={reload} />}
              selectable={bulk.selecting}
              selected={bulk.selected.has(surprise.id)}
              onToggle={() => bulk.toggle(surprise.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/surprises" items={sorted} onChanged={reload}>
          {(surprise) => (
            <ListCard
              title={surprise.title}
              subtitle={surprise.message}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  {surprise.emoji && <Badge tone="rose">{surprise.emoji}</Badge>}
                  <Badge tone="neutral">#{surprise.order}</Badge>
                </div>
              }
              href={`/surprises/${surprise.id}`}
              actions={<DeleteButton id={surprise.id} path="/surprises" onDeleted={reload} />}
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
