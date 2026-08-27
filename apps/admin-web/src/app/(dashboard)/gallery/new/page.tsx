import { PageHeader } from "@/components/crud";
import { GalleryForm } from "@/components/gallery-form";

export default function NewGalleryPage() {
  return (
    <div>
      <PageHeader title="New image" backHref="/gallery" />
      <GalleryForm />
    </div>
  );
}
