"use client";

import { useState } from "react";

import type { DateIdea } from "@repo/shared";

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

export default function DatesPage() {
  const { data: dates, loading, error, reload } = useData<DateIdea>("/dates");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...dates]
    .filter((date) =>
      needle
        ? date.title.toLowerCase().includes(needle) ||
          date.description.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => a.order - b.order);

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/dates", [...bulk.selected]);
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
        title="Dates"
        subtitle="The date ideas on the surprise wheel."
        newHref="/dates/new"
        newLabel="New date"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />
      {!bulk.selecting && dates.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search dates…"
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
          title="No dates yet"
          description="Add the first date idea to the surprise wheel."
          href="/dates/new"
          hrefLabel="Add date"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((date) => (
            <ListCard
              key={date.id}
              title={date.title}
              subtitle={date.description}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  {date.emoji && <Badge tone="rose">{date.emoji}</Badge>}
                  {date.tag && <Badge tone="neutral">{date.tag}</Badge>}
                  <Badge tone="neutral">#{date.order}</Badge>
                </div>
              }
              href={`/dates/${date.id}`}
              actions={<DeleteButton id={date.id} path="/dates" onDeleted={reload} />}
              selectable={bulk.selecting}
              selected={bulk.selected.has(date.id)}
              onToggle={() => bulk.toggle(date.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/dates" items={sorted} onChanged={reload}>
          {(date) => (
            <ListCard
              title={date.title}
              subtitle={date.description}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  {date.emoji && <Badge tone="rose">{date.emoji}</Badge>}
                  {date.tag && <Badge tone="neutral">{date.tag}</Badge>}
                  <Badge tone="neutral">#{date.order}</Badge>
                </div>
              }
              href={`/dates/${date.id}`}
              actions={<DeleteButton id={date.id} path="/dates" onDeleted={reload} />}
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
