import { PageHeader } from "@/components/crud";
import { MemoryForm } from "@/components/memory-form";

export default function NewMemoryPage() {
  return (
    <div>
      <PageHeader title="New memory" backHref="/memories" />
      <MemoryForm />
    </div>
  );
}
