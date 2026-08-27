"use client";

import { useParams } from "next/navigation";

import type { Memory } from "@repo/shared";

import { MemoryForm } from "@/components/memory-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditMemoryPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<Memory>("/memories");
  const memory = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!memory) return <ErrorState message="Memory not found" />;

  return (
    <div>
      <PageHeader title="Edit memory" backHref="/memories" />
      <MemoryForm memory={memory} />
    </div>
  );
}
