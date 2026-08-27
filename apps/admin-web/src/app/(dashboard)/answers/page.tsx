"use client";

import { useState } from "react";

import type { Answer, Question } from "@repo/shared";

import { EmptyState, LoadingState, PageHeader, ErrorState, ListCard } from "@/components/crud";
import { Badge, SearchInput } from "@/components/ui";
import { useData } from "@/lib/use-data";

export default function AnswersPage() {
  const { data: answers, loading, error } = useData<Answer>("/answers");
  const { data: questions } = useData<Question>("/questions");
  const [query, setQuery] = useState("");

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const optionLabel = (question: Question | undefined, optionId: string) =>
    question?.options.find((option) => option.id === optionId)?.label ?? optionId;

  const needle = query.trim().toLowerCase();
  const sorted = [...answers]
    .filter((answer) => {
      if (!needle) return true;
      const question = questions.find((q) => q.id === answer.questionId);
      const haystack = [
        question?.title ?? "",
        question?.subtitle ?? "",
        optionLabel(question, answer.optionId),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    })
    .sort(
      (a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime(),
    );

  return (
    <div>
      <PageHeader
        title="Answers"
        subtitle="What visitors answered on the quiz."
      />
      {answers.length > 1 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search answers…"
          className="mb-4"
        />
      )}
      {sorted.length === 0 ? (
        <EmptyState title="No answers yet" description="Answers appear here once someone plays the quiz." />
      ) : (
        <div className="space-y-3">
          {sorted.map((answer) => {
            const question = questions.find((q) => q.id === answer.questionId);
            return (
              <ListCard
                key={answer.id}
                title={question?.title ?? answer.questionId}
                subtitle={new Date(answer.answeredAt).toLocaleString()}
                meta={<Badge tone="rose">{optionLabel(question, answer.optionId)}</Badge>}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
