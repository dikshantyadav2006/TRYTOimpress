"use client";

import { useState } from "react";

import type { Page } from "@repo/shared";

import { DeleteButton, EmptyState, ListCard, LoadingState, PageHeader, ErrorState } from "@/components/crud";
import { Badge, SearchInput } from "@/components/ui";
import { BulkBar, SelectAllButton, SelectButton, bulkDelete, useBulkSelection } from "@/components/bulk";
import { ReorderList } from "@/components/reorder";
import { useToast } from "@/components/toast";
import { useData } from "@/lib/use-data";

export default function PagesPage() {
  const { data: pages, loading, error, reload } = useData<Page>("/pages");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...pages]
    .filter((page) =>
      needle
        ? page.title.toLowerCase().includes(needle) || page.slug.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/pages", [...bulk.selected]);
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
        title="Pages"
        subtitle="Edit existing chapters or create new custom pages."
        newHref="/pages/new"
        newLabel="New page"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />
      {!bulk.selecting && pages.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by title or slug…"
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
          title="No pages yet"
          description="Create the first page of the site."
          href="/pages/new"
          hrefLabel="Add page"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((page) => (
            <ListCard
              key={page.id}
              title={page.title}
              subtitle={`/${page.slug}`}
              meta={
                page.published ? (
                  <Badge tone="emerald">published</Badge>
                ) : (
                  <Badge tone="amber">unpublished</Badge>
                )
              }
              href={`/pages/${page.id}`}
              actions={<DeleteButton id={page.id} path="/pages" onDeleted={reload} />}
              selectable={bulk.selecting}
              selected={bulk.selected.has(page.id)}
              onToggle={() => bulk.toggle(page.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/pages" items={sorted} onChanged={reload}>
          {(page) => (
            <ListCard
              title={page.title}
              subtitle={`/${page.slug}`}
              meta={
                page.published ? (
                  <Badge tone="emerald">published</Badge>
                ) : (
                  <Badge tone="amber">unpublished</Badge>
                )
              }
              href={`/pages/${page.id}`}
              actions={<DeleteButton id={page.id} path="/pages" onDeleted={reload} />}
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
