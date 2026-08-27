import { PageHeader } from "@/components/crud";
import { DreamForm } from "@/components/dream-form";

export default function NewDreamPage() {
  return (
    <div>
      <PageHeader title="New dream" backHref="/dreams" />
      <DreamForm />
    </div>
  );
}
