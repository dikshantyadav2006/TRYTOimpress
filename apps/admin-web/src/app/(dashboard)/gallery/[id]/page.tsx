"use client";

import { useParams } from "next/navigation";

import type { GalleryImage } from "@repo/shared";

import { GalleryForm } from "@/components/gallery-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditGalleryPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<GalleryImage>("/gallery");
  const image = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!image) return <ErrorState message="Image not found" />;

  return (
    <div>
      <PageHeader title="Edit image" backHref="/gallery" />
      <GalleryForm image={image} />
    </div>
  );
}
