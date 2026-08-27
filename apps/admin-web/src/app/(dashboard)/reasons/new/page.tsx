import { PageHeader } from "@/components/crud";
import { ReasonForm } from "@/components/reason-form";

export default function NewReasonPage() {
  return (
    <div>
      <PageHeader title="New reason" backHref="/reasons" />
      <ReasonForm />
    </div>
  );
}
