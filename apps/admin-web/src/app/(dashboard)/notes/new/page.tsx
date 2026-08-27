import { PageHeader } from "@/components/crud";
import { NoteForm } from "@/components/note-form";

export default function NewNotePage() {
  return (
    <div>
      <PageHeader title="New love note" backHref="/notes" />
      <NoteForm />
    </div>
  );
}
