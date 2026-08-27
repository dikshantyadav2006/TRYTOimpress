import { PageHeader } from "@/components/crud";
import { SurpriseForm } from "@/components/surprise-form";

export default function NewSurprisePage() {
  return (
    <div>
      <PageHeader title="New surprise" backHref="/surprises" />
      <SurpriseForm />
    </div>
  );
}
