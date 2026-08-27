"use client";

import { useState } from "react";

import type { Capsule } from "@repo/shared";

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

export default function CapsulesPage() {
  const { data: capsules, loading, error, reload } = useData<Capsule>("/capsules");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...capsules]
    .filter((capsule) =>
      needle
        ? capsule.title.toLowerCase().includes(needle) ||
          capsule.message.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => a.order - b.order);

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/capsules", [...bulk.selected]);
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
        title="Time capsules"
        subtitle="Messages sealed until their date arrives."
        newHref="/capsules/new"
        newLabel="New capsule"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />
      {!bulk.selecting && capsules.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search capsules…"
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
          title="No capsules yet"
          description="Bury the first message for future you."
          href="/capsules/new"
          hrefLabel="Add capsule"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((capsule) => (
            <ListCard
              key={capsule.id}
              title={capsule.title}
              subtitle={`${capsule.message} — opens ${capsule.unlockDate}`}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  {capsule.emoji && <Badge tone="rose">{capsule.emoji}</Badge>}
                  <Badge tone="neutral">#{capsule.order}</Badge>
                </div>
              }
              href={`/capsules/${capsule.id}`}
              actions={<DeleteButton id={capsule.id} path="/capsules" onDeleted={reload} />}
              selectable={bulk.selecting}
              selected={bulk.selected.has(capsule.id)}
              onToggle={() => bulk.toggle(capsule.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/capsules" items={sorted} onChanged={reload}>
          {(capsule) => (
            <ListCard
              title={capsule.title}
              subtitle={`${capsule.message} — opens ${capsule.unlockDate}`}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  {capsule.emoji && <Badge tone="rose">{capsule.emoji}</Badge>}
                  <Badge tone="neutral">#{capsule.order}</Badge>
                </div>
              }
              href={`/capsules/${capsule.id}`}
              actions={<DeleteButton id={capsule.id} path="/capsules" onDeleted={reload} />}
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
