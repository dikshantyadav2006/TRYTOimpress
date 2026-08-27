"use client";

import { useState } from "react";

import type { LoveNote } from "@repo/shared";

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

export default function NotesPage() {
  const { data: notes, loading, error, reload } = useData<LoveNote>("/notes");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...notes]
    .filter((note) => (needle ? note.text.toLowerCase().includes(needle) : true))
    .sort((a, b) => a.order - b.order);

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/notes", [...bulk.selected]);
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
        title="Love jar"
        subtitle="The little notes pulled out of the jar."
        newHref="/notes/new"
        newLabel="New note"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />
      {!bulk.selecting && notes.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search notes…"
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
          title="No notes yet"
          description="Fill the jar with little things you love about her."
          href="/notes/new"
          hrefLabel="Add note"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((note) => (
            <ListCard
              key={note.id}
              title={note.emoji || "Love note"}
              subtitle={note.text}
              meta={<Badge tone="neutral">#{note.order}</Badge>}
              href={`/notes/${note.id}`}
              actions={<DeleteButton id={note.id} path="/notes" onDeleted={reload} />}
              selectable={bulk.selecting}
              selected={bulk.selected.has(note.id)}
              onToggle={() => bulk.toggle(note.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/notes" items={sorted} onChanged={reload}>
          {(note) => (
            <ListCard
              title={note.emoji || "Love note"}
              subtitle={note.text}
              meta={<Badge tone="neutral">#{note.order}</Badge>}
              href={`/notes/${note.id}`}
              actions={<DeleteButton id={note.id} path="/notes" onDeleted={reload} />}
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
