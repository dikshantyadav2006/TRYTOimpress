"use client";

import { useState } from "react";

import type { Letter } from "@repo/shared";

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

export default function LettersPage() {
  const { data: letters, loading, error, reload } = useData<Letter>("/letters");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...letters]
    .filter((letter) =>
      needle
        ? letter.title.toLowerCase().includes(needle) ||
          letter.message.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => a.order - b.order);

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/letters", [...bulk.selected]);
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
        title="Letters"
        subtitle="The letters in the Open When… chapter."
        newHref="/letters/new"
        newLabel="New letter"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />
      {!bulk.selecting && letters.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search letters…"
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
          title="No letters yet"
          description="Add the first letter to the Open When… chapter."
          href="/letters/new"
          hrefLabel="Add letter"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((letter) => (
            <ListCard
              key={letter.id}
              title={letter.title}
              subtitle={letter.message}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  {letter.emoji && <Badge tone="rose">{letter.emoji}</Badge>}
                  <Badge tone="neutral">#{letter.order}</Badge>
                </div>
              }
              href={`/letters/${letter.id}`}
              actions={<DeleteButton id={letter.id} path="/letters" onDeleted={reload} />}
              selectable={bulk.selecting}
              selected={bulk.selected.has(letter.id)}
              onToggle={() => bulk.toggle(letter.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/letters" items={sorted} onChanged={reload}>
          {(letter) => (
            <ListCard
              title={letter.title}
              subtitle={letter.message}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  {letter.emoji && <Badge tone="rose">{letter.emoji}</Badge>}
                  <Badge tone="neutral">#{letter.order}</Badge>
                </div>
              }
              href={`/letters/${letter.id}`}
              actions={<DeleteButton id={letter.id} path="/letters" onDeleted={reload} />}
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
