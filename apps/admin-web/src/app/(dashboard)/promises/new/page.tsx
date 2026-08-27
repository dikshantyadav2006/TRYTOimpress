import { PageHeader } from "@/components/crud";
import { PromiseForm } from "@/components/promise-form";

export default function NewPromisePage() {
  return (
    <div>
      <PageHeader title="New promise" backHref="/promises" />
      <PromiseForm />
    </div>
  );
}
