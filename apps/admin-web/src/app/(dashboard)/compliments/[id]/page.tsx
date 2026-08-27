"use client";

import { useParams } from "next/navigation";

import type { Compliment } from "@repo/shared";

import { ComplimentForm } from "@/components/compliment-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditComplimentPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<Compliment>("/compliments");
  const compliment = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!compliment) return <ErrorState message="Compliment not found" />;

  return (
    <div>
      <PageHeader title="Edit compliment" backHref="/compliments" />
      <ComplimentForm compliment={compliment} />
    </div>
  );
}
