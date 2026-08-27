import { PageHeader } from "@/components/crud";
import { CapsuleForm } from "@/components/capsule-form";

export default function NewCapsulePage() {
  return (
    <div>
      <PageHeader title="New time capsule" backHref="/capsules" />
      <CapsuleForm />
    </div>
  );
}
