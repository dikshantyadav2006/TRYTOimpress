import { PageHeader } from "@/components/crud";
import { LetterForm } from "@/components/letter-form";

export default function NewLetterPage() {
  return (
    <div>
      <PageHeader title="New letter" backHref="/letters" />
      <LetterForm />
    </div>
  );
}
