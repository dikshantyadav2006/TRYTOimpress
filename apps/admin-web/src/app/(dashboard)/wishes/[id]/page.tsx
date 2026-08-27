"use client";

import { useParams } from "next/navigation";

import type { Wish } from "@repo/shared";

import { WishForm } from "@/components/wish-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditWishPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<Wish>("/wishes");
  const wish = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!wish) return <ErrorState message="Wish not found" />;

  return (
    <div>
      <PageHeader title="Edit wish" backHref="/wishes" />
      <WishForm wish={wish} />
    </div>
  );
}
