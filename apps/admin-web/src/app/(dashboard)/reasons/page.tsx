"use client";

import { useState } from "react";

import type { Reason } from "@repo/shared";

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

export default function ReasonsPage() {
  const { data: reasons, loading, error, reload } = useData<Reason>("/reasons");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...reasons]
    .filter((reason) =>
      needle
        ? reason.title.toLowerCase().includes(needle) ||
          reason.detail.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => a.order - b.order);

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/reasons", [...bulk.selected]);
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
        title="Reasons"
        subtitle="The reasons in the Why You chapter."
        newHref="/reasons/new"
        newLabel="New reason"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />
      {!bulk.selecting && reasons.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search reasons…"
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
          title="No reasons yet"
          description="Add the first reason to the Why You chapter."
          href="/reasons/new"
          hrefLabel="Add reason"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((reason) => (
            <ListCard
              key={reason.id}
              title={reason.title}
              subtitle={reason.detail}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  {reason.emoji && <Badge tone="rose">{reason.emoji}</Badge>}
                  <Badge tone="neutral">#{reason.order}</Badge>
                </div>
              }
              href={`/reasons/${reason.id}`}
              actions={<DeleteButton id={reason.id} path="/reasons" onDeleted={reload} />}
              selectable={bulk.selecting}
              selected={bulk.selected.has(reason.id)}
              onToggle={() => bulk.toggle(reason.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/reasons" items={sorted} onChanged={reload}>
          {(reason) => (
            <ListCard
              title={reason.title}
              subtitle={reason.detail}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  {reason.emoji && <Badge tone="rose">{reason.emoji}</Badge>}
                  <Badge tone="neutral">#{reason.order}</Badge>
                </div>
              }
              href={`/reasons/${reason.id}`}
              actions={<DeleteButton id={reason.id} path="/reasons" onDeleted={reload} />}
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
