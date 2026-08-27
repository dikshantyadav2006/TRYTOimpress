"use client";

import { useParams } from "next/navigation";

import type { Letter } from "@repo/shared";

import { LetterForm } from "@/components/letter-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditLetterPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<Letter>("/letters");
  const letter = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!letter) return <ErrorState message="Letter not found" />;

  return (
    <div>
      <PageHeader title="Edit letter" backHref="/letters" />
      <LetterForm letter={letter} />
    </div>
  );
}
