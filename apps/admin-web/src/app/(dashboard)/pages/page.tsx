"use client";

import { useEffect, useState } from "react";

import type { Page } from "@repo/shared";

import { EmptyState, ListCard, LoadingState, PageHeader, ErrorState } from "@/components/crud";
import { Badge, SearchInput, Switch } from "@/components/ui";
import { BulkBar, SelectAllButton, SelectButton, bulkDelete, useBulkSelection } from "@/components/bulk";
import { ReorderList } from "@/components/reorder";
import { useToast } from "@/components/toast";
import { del, put } from "@/lib/api";
import { friendlyError } from "@/lib/errors";
import { useData } from "@/lib/use-data";

function PageMeta({ page }: { page: Page }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {page.published ? (
        <Badge tone="emerald">visible</Badge>
      ) : (
        <Badge tone="amber">hidden</Badge>
      )}
      {page.chapter && <Badge tone="rose">in chapters</Badge>}
    </div>
  );
}

function PageRow({
  page,
  busy,
  onTogglePublished,
  onToggleChapter,
  onDeleted,
}: {
  page: Page;
  busy: string | null;
  onTogglePublished: (page: Page) => void;
  onToggleChapter: (page: Page) => void;
  onDeleted: (page: Page) => void;
}) {
  return (
    <ListCard
      title={page.title}
      subtitle={`/${page.slug}`}
      meta={<PageMeta page={page} />}
      href={`/pages/${page.id}`}
      actions={
        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-1.5"
            title={page.published ? "Click to hide from web" : "Click to show on web"}
          >
            <Switch
              checked={page.published}
              onChange={() => onTogglePublished(page)}
              label={page.published ? "Unpublish" : "Publish"}
            />
            <span className="text-muted-foreground hidden text-[11px] sm:inline">
              show
            </span>
          </span>
          <span
            className="flex items-center gap-1.5"
            title={page.chapter ? "Remove from chapter navigator" : "Add to chapter navigator"}
          >
            <Switch
              checked={Boolean(page.chapter)}
              onChange={() => onToggleChapter(page)}
              label={page.chapter ? "Remove from chapters" : "Add to chapters"}
            />
            <span className="text-muted-foreground hidden text-[11px] sm:inline">
              chapters
            </span>
          </span>
          <button
            type="button"
            disabled={busy === page.id}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDeleted(page);
            }}
            aria-label="Delete page"
            className="text-muted-foreground hover:text-rose-300 disabled:opacity-50 rounded-lg px-2 py-2 text-xs font-medium transition-colors"
          >
            {busy === page.id ? "…" : "delete"}
          </button>
        </div>
      }
    />
  );
}

export default function PagesPage() {
  const { data: pages, loading, error, reloadSilently } = useData<Page>("/pages");
  const [items, setItems] = useState<Page[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    setItems(pages);
  }, [pages]);

  const needle = query.trim().toLowerCase();
  const sorted = [...items]
    .filter((page) =>
      needle
        ? page.title.toLowerCase().includes(needle) || page.slug.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const togglePublished = async (page: Page) => {
    const next = page.published;
    setItems((current) => current.map((p) => (p.id === page.id ? ({ ...p, published: !p.published } as Page) : p)));
    setBusy(page.id);
    try {
      await put(`/pages/${page.id}`, { published: !next });
      showToast("success", next ? "Page hidden" : "Page is now visible");
    } catch (err) {
      setItems((current) => current.map((p) => (p.id === page.id ? ({ ...p, published: next } as Page) : p)));
      showToast("error", friendlyError(err).message);
    } finally {
      setBusy(null);
    }
  };

  const toggleChapter = async (page: Page) => {
    const next = page.chapter;
    setItems((current) => current.map((p) => (p.id === page.id ? ({ ...p, chapter: !p.chapter } as Page) : p)));
    setBusy(page.id);
    try {
      await put(`/pages/${page.id}`, { chapter: !next });
      showToast("success", next ? "Removed from chapters" : "Added to chapters");
    } catch (err) {
      setItems((current) => current.map((p) => (p.id === page.id ? ({ ...p, chapter: next } as Page) : p)));
      showToast("error", friendlyError(err).message);
    } finally {
      setBusy(null);
    }
  };

  const removeLocal = (id: string) => {
    setItems((current) => current.filter((p) => p.id !== id));
  };

  const onDelete = async (page: Page) => {
    setBusy(page.id);
    removeLocal(page.id);
    try {
      await del(`/pages/${page.id}`);
      if (bulk.selected.has(page.id)) bulk.clear();
      showToast("success", "Page deleted");
    } catch (err) {
      setItems((current) => [...current, page]);
      showToast("error", friendlyError(err).message);
    } finally {
      setBusy(null);
    }
  };

  const onBulkDelete = async () => {
    const selected = [...bulk.selected];
    setItems((current) => current.filter((p) => !bulk.selected.has(p.id)));
    try {
      await bulkDelete("/pages", selected);
      bulk.clear();
      showToast("success", "Deleted");
    } catch {
      showToast("error", "Delete failed");
    }
  };

  return (
    <div>
      <PageHeader
        title="Chapters & pages"
        subtitle="Toggle which chapters are visible on the web and which appear in the chapter navigator."
        newHref="/pages/new"
        newLabel="New page"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />
      <p className="text-muted-foreground mb-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs">
        <span className="flex items-center gap-2">
          <Switch checked onChange={() => {}} label="visible toggle" /> show — visible on the web
        </span>
        <span className="flex items-center gap-2">
          <Switch checked onChange={() => {}} label="chapters toggle" /> chapters — appears in the chapter navigator
        </span>
      </p>
      {!bulk.selecting && items.length > 1 && (
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
          title="No chapters yet"
          description="Create the first chapter of the site."
          href="/pages/new"
          hrefLabel="Add chapter"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((page) => (
            <ListCard
              key={page.id}
              title={page.title}
              subtitle={`/${page.slug}`}
              meta={<PageMeta page={page} />}
              href={`/pages/${page.id}`}
              selectable={bulk.selecting}
              selected={bulk.selected.has(page.id)}
              onToggle={() => bulk.toggle(page.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/pages" items={sorted} onChanged={() => void reloadSilently()}>
          {(page) => (
            <PageRow
              page={page}
              busy={busy}
              onTogglePublished={(p) => void togglePublished(p)}
              onToggleChapter={(p) => void toggleChapter(p)}
              onDeleted={(p) => void onDelete(p)}
            />
          )}
        </ReorderList>
      )}

      {bulk.selecting && (
        <BulkBar
          count={bulk.selected.size}
          onClear={bulk.clear}
          onDelete={() => void onBulkDelete()}
        />
      )}
    </div>
  );
}
