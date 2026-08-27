import { PageHeader } from "@/components/crud";
import { PageForm } from "@/components/page-form";

export default function NewPagePage() {
  return (
    <div>
      <PageHeader title="New page" backHref="/pages" />
      <PageForm />
    </div>
  );
}
