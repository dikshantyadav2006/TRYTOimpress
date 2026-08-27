"use client";

import { useParams } from "next/navigation";

import type { DateIdea } from "@repo/shared";

import { DateForm } from "@/components/date-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditDatePage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<DateIdea>("/dates");
  const dateIdea = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!dateIdea) return <ErrorState message="Date not found" />;

  return (
    <div>
      <PageHeader title="Edit date" backHref="/dates" />
      <DateForm dateIdea={dateIdea} />
    </div>
  );
}
