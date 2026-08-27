"use client";

import { useState } from "react";

import type { Compliment } from "@repo/shared";

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

export default function ComplimentsPage() {
  const { data: compliments, loading, error, reload } = useData<Compliment>("/compliments");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...compliments]
    .filter((compliment) =>
      needle ? compliment.text.toLowerCase().includes(needle) : true,
    )
    .sort((a, b) => a.order - b.order);

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/compliments", [...bulk.selected]);
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
        title="Compliments"
        subtitle="The nice things she gets showered with."
        newHref="/compliments/new"
        newLabel="New compliment"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />
      {!bulk.selecting && compliments.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search compliments…"
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
          title="No compliments yet"
          description="Tell her all the nice things she deserves to hear."
          href="/compliments/new"
          hrefLabel="Add compliment"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((compliment) => (
            <ListCard
              key={compliment.id}
              title={compliment.emoji || "Compliment"}
              subtitle={compliment.text}
              meta={<Badge tone="neutral">#{compliment.order}</Badge>}
              href={`/compliments/${compliment.id}`}
              actions={<DeleteButton id={compliment.id} path="/compliments" onDeleted={reload} />}
              selectable={bulk.selecting}
              selected={bulk.selected.has(compliment.id)}
              onToggle={() => bulk.toggle(compliment.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/compliments" items={sorted} onChanged={reload}>
          {(compliment) => (
            <ListCard
              title={compliment.emoji || "Compliment"}
              subtitle={compliment.text}
              meta={<Badge tone="neutral">#{compliment.order}</Badge>}
              href={`/compliments/${compliment.id}`}
              actions={<DeleteButton id={compliment.id} path="/compliments" onDeleted={reload} />}
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
