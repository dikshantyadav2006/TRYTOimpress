"use client";

import { useParams } from "next/navigation";

import type { Capsule } from "@repo/shared";

import { CapsuleForm } from "@/components/capsule-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditCapsulePage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<Capsule>("/capsules");
  const capsule = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!capsule) return <ErrorState message="Capsule not found" />;

  return (
    <div>
      <PageHeader title="Edit time capsule" backHref="/capsules" />
      <CapsuleForm capsule={capsule} />
    </div>
  );
}
