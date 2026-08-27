"use client";

import { useParams } from "next/navigation";

import type { LovePromise } from "@repo/shared";

import { PromiseForm } from "@/components/promise-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditPromisePage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<LovePromise>("/promises");
  const promise = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!promise) return <ErrorState message="Promise not found" />;

  return (
    <div>
      <PageHeader title="Edit promise" backHref="/promises" />
      <PromiseForm promise={promise} />
    </div>
  );
}
