"use client";

import { useState } from "react";

import type { Wish } from "@repo/shared";

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

export default function WishesPage() {
  const { data: wishes, loading, error, reload } = useData<Wish>("/wishes");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...wishes]
    .filter((wish) => (needle ? wish.text.toLowerCase().includes(needle) : true))
    .sort((a, b) => a.order - b.order);

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/wishes", [...bulk.selected]);
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
        title="Wishes"
        subtitle="The wishes hanging on the tree."
        newHref="/wishes/new"
        newLabel="New wish"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />
      {!bulk.selecting && wishes.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search wishes…"
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
          title="No wishes yet"
          description="Hang the first wish on the tree."
          href="/wishes/new"
          hrefLabel="Add wish"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((wish) => (
            <ListCard
              key={wish.id}
              title={wish.emoji || "Wish"}
              subtitle={wish.text}
              meta={<Badge tone="neutral">#{wish.order}</Badge>}
              href={`/wishes/${wish.id}`}
              actions={<DeleteButton id={wish.id} path="/wishes" onDeleted={reload} />}
              selectable={bulk.selecting}
              selected={bulk.selected.has(wish.id)}
              onToggle={() => bulk.toggle(wish.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/wishes" items={sorted} onChanged={reload}>
          {(wish) => (
            <ListCard
              title={wish.emoji || "Wish"}
              subtitle={wish.text}
              meta={<Badge tone="neutral">#{wish.order}</Badge>}
              href={`/wishes/${wish.id}`}
              actions={<DeleteButton id={wish.id} path="/wishes" onDeleted={reload} />}
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
