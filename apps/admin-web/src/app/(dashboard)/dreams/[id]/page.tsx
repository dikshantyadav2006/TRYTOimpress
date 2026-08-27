"use client";

import { useParams } from "next/navigation";

import type { Dream } from "@repo/shared";

import { DreamForm } from "@/components/dream-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditDreamPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<Dream>("/dreams");
  const dream = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!dream) return <ErrorState message="Dream not found" />;

  return (
    <div>
      <PageHeader title="Edit dream" backHref="/dreams" />
      <DreamForm dream={dream} />
    </div>
  );
}
