"use client";

import { useParams } from "next/navigation";

import type { Page } from "@repo/shared";

import { PageForm } from "@/components/page-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditPagePage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<Page>("/pages");
  const page = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!page) return <ErrorState message="Page not found" />;

  return (
    <div>
      <PageHeader title="Edit page" backHref="/pages" />
      <PageForm page={page} />
    </div>
  );
}
