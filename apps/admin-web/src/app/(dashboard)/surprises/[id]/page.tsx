"use client";

import { useParams } from "next/navigation";

import type { Surprise } from "@repo/shared";

import { SurpriseForm } from "@/components/surprise-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditSurprisePage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<Surprise>("/surprises");
  const surprise = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!surprise) return <ErrorState message="Surprise not found" />;

  return (
    <div>
      <PageHeader title="Edit surprise" backHref="/surprises" />
      <SurpriseForm surprise={surprise} />
    </div>
  );
}
