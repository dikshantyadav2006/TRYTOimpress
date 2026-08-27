"use client";

import { useParams } from "next/navigation";

import type { Question } from "@repo/shared";

import { QuestionForm } from "@/components/question-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditQuestionPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<Question>("/questions");
  const question = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!question) return <ErrorState message="Question not found" />;

  return (
    <div>
      <PageHeader title="Edit question" backHref="/questions" />
      <QuestionForm question={question} />
    </div>
  );
}
