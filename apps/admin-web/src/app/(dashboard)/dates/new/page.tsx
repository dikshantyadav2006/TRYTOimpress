import { PageHeader } from "@/components/crud";
import { DateForm } from "@/components/date-form";

export default function NewDatePage() {
  return (
    <div>
      <PageHeader title="New date" backHref="/dates" />
      <DateForm />
    </div>
  );
}
