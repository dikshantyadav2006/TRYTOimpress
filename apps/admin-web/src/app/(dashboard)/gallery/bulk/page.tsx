import { BulkUploadForm } from "@/components/bulk-upload-form";
import { PageHeader } from "@/components/crud";

export default function BulkGalleryPage() {
  return (
    <div>
      <PageHeader title="Bulk upload" subtitle="Add many photos or videos to the gallery at once." backHref="/gallery" />
      <BulkUploadForm />
    </div>
  );
}
