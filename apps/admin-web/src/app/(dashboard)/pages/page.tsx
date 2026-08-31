"use client";

import { useEffect, useState } from "react";

import type { Page } from "@repo/shared";
import { sitePagePath } from "@repo/shared";
import { Link2 } from "lucide-react";

import { EmptyState, ListCard, LoadingState, PageHeader, ErrorState } from "@/components/crud";
import { Badge, SearchInput, SegmentedControl, Switch } from "@/components/ui";
import { BulkBar, SelectAllButton, SelectButton, bulkDelete, useBulkSelection } from "@/components/bulk";
import { ReorderList } from "@/components/reorder";
import { useToast } from "@/components/toast";
import { useAuth } from "@/context/auth-provider";
import { del, put } from "@/lib/api";
import { friendlyError } from "@/lib/errors";
import { useData } from "@/lib/use-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://trytotry.onrender.com"
    : "http://localhost:3000");

type Visibility = "visible" | "link" | "hidden";

const VISIBILITY_TONES: Record<Visibility, "emerald" | "amber" | "neutral"> = {
  visible: "emerald",
  link: "amber",
  hidden: "neutral",
};

const VISIBILITY_LABELS: Record<Visibility, string> = {
  visible: "visible",
  link: "link only",
  hidden: "hidden",
};

function PageMeta({ page }: { page: Page }) {
  const tone = VISIBILITY_TONES[page.visibility] ?? "neutral";
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge tone={tone}>{VISIBILITY_LABELS[page.visibility] ?? page.visibility}</Badge>
      {page.chapter && <Badge tone="rose">in chapters</Badge>}
    </div>
  );
}

function PageRow({
  page,
  busy,
  userSlug,
  onVisibility,
  onToggleChapter,
  onDeleted,
}: {
  page: Page;
  busy: string | null;
  userSlug?: string | undefined;
  onVisibility: (page: Page, visibility: Visibility) => void;
  onToggleChapter: (page: Page) => void;
  onDeleted: (page: Page) => void;
}) {
  const { showToast } = useToast();

  const copyShareLink = async () => {
    const url = `${SITE_URL}/u/${userSlug}${sitePagePath(page.slug)}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("success", "Share link copied");
    } catch {
      showToast("error", "Could not copy link");
    }
  };

  return (
    <ListCard
      title={page.title}
      subtitle={`/${page.slug}`}
      meta={<PageMeta page={page} />}
      href={`/pages/${page.id}`}
      actions={
        <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
          <span
            className="w-48"
            title="Visible: on the web & navigator. Link only: shareable, not listed. Hidden: private."
          >
            <SegmentedControl
              name="Visibility"
              size="sm"
              value={page.visibility}
              onChange={(value) => onVisibility(page, value)}
              options={[
                { value: "visible" as const, label: "Show" },
                { value: "link" as const, label: "Link" },
                { value: "hidden" as const, label: "Hide" },
              ]}
            />
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
            <span className="text-muted-foreground hidden text-[11px] sm:inline">chapters</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void copyShareLink();
              }}
              aria-label="Copy share link"
              title="Copy share link"
              className="text-muted-foreground hover:text-foreground rounded-lg p-2 transition-colors"
            >
              <Link2 className="h-4 w-4" />
            </button>
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
        </div>
      }
    />
  );
}

export default function PagesPage() {
  const { data: pages, loading, error, reloadSilently } = useData<Page>("/pages");
  const { user } = useAuth();
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

  const setVisibility = async (page: Page, visibility: Visibility) => {
    const prev = page.visibility;
    setItems((current) => current.map((p) => (p.id === page.id ? ({ ...p, visibility } as Page) : p)));
    setBusy(page.id);
    try {
      await put(`/pages/${page.id}`, { visibility });
      showToast(
        "success",
        visibility === "visible"
          ? "Page is visible on the web"
          : visibility === "link"
            ? "Page shared via link only"
            : "Page hidden",
      );
    } catch (err) {
      setItems((current) => current.map((p) => (p.id === page.id ? ({ ...p, visibility: prev } as Page) : p)));
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
        subtitle="Control visibility and navigation for each page."
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
          <Badge tone="emerald">Show</Badge> visible on the web & in the navigator
        </span>
        <span className="flex items-center gap-2">
          <Badge tone="amber">Link</Badge> shareable by link, not listed
        </span>
        <span className="flex items-center gap-2">
          <Badge tone="neutral">Hide</Badge> private, admins only
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
              userSlug={user?.slug}
              onVisibility={(p, v) => void setVisibility(p, v)}
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
