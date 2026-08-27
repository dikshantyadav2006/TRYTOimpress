"use client";

import { useState } from "react";

import type { Question } from "@repo/shared";

import { DeleteButton, EmptyState, ListCard, LoadingState, PageHeader, ErrorState } from "@/components/crud";
import { Badge, SearchInput } from "@/components/ui";
import { BulkBar, SelectAllButton, SelectButton, bulkDelete, useBulkSelection } from "@/components/bulk";
import { ReorderList } from "@/components/reorder";
import { useToast } from "@/components/toast";
import { useData } from "@/lib/use-data";

export default function QuestionsPage() {
  const { data: questions, loading, error, reload } = useData<Question>("/questions");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const needle = query.trim().toLowerCase();
  const sorted = [...questions]
    .filter((question) =>
      needle
        ? question.title.toLowerCase().includes(needle) ||
          question.subtitle.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const bulk = useBulkSelection(sorted);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const onBulkDelete = async () => {
    setDeleting(true);
    try {
      await bulkDelete("/questions", [...bulk.selected]);
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
        title="Questions"
        subtitle="The quiz — questions, options & correct answers."
        newHref="/questions/new"
        newLabel="New question"
        action={
          <SelectButton
            selecting={bulk.selecting}
            onToggle={bulk.selecting ? bulk.cancel : bulk.begin}
          />
        }
      />
      {!bulk.selecting && questions.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search questions…"
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
          title="No questions yet"
          description="Add the first question to the quiz."
          href="/questions/new"
          hrefLabel="Add question"
        />
      ) : bulk.selecting ? (
        <div className="space-y-3">
          {sorted.map((question) => (
            <ListCard
              key={question.id}
              title={`${question.emoji ?? ""} ${question.title}`.trim()}
              subtitle={question.subtitle}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="neutral">{question.options?.length ?? 0} options</Badge>
                  {question.correctAnswerId && <Badge tone="emerald">has answer</Badge>}
                </div>
              }
              href={`/questions/${question.id}`}
              actions={<DeleteButton id={question.id} path="/questions" onDeleted={reload} />}
              selectable={bulk.selecting}
              selected={bulk.selected.has(question.id)}
              onToggle={() => bulk.toggle(question.id)}
            />
          ))}
        </div>
      ) : (
        <ReorderList path="/questions" items={sorted} onChanged={reload}>
          {(question) => (
            <ListCard
              title={`${question.emoji ?? ""} ${question.title}`.trim()}
              subtitle={question.subtitle}
              meta={
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="neutral">{question.options?.length ?? 0} options</Badge>
                  {question.correctAnswerId && <Badge tone="emerald">has answer</Badge>}
                </div>
              }
              href={`/questions/${question.id}`}
              actions={<DeleteButton id={question.id} path="/questions" onDeleted={reload} />}
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
