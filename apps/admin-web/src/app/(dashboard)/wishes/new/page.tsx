import { PageHeader } from "@/components/crud";
import { WishForm } from "@/components/wish-form";

export default function NewWishPage() {
  return (
    <div>
      <PageHeader title="New wish" backHref="/wishes" />
      <WishForm />
    </div>
  );
}
