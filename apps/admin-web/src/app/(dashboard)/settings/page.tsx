import { PageHeader } from "@/components/crud";
import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Copy for the landing page, the proposal, the success screen, and music."
      />
      <SettingsForm />
    </div>
  );
}
