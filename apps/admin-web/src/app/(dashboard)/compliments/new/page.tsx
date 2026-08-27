import { PageHeader } from "@/components/crud";
import { ComplimentForm } from "@/components/compliment-form";

export default function NewComplimentPage() {
  return (
    <div>
      <PageHeader title="New compliment" backHref="/compliments" />
      <ComplimentForm />
    </div>
  );
}
