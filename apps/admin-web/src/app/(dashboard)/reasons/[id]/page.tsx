"use client";

import { useParams } from "next/navigation";

import type { Reason } from "@repo/shared";

import { ReasonForm } from "@/components/reason-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditReasonPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<Reason>("/reasons");
  const reason = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!reason) return <ErrorState message="Reason not found" />;

  return (
    <div>
      <PageHeader title="Edit reason" backHref="/reasons" />
      <ReasonForm reason={reason} />
    </div>
  );
}
