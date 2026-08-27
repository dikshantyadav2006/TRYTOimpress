"use client";

import { useParams } from "next/navigation";

import type { LoveNote } from "@repo/shared";

import { NoteForm } from "@/components/note-form";
import { LoadingState, ErrorState, PageHeader } from "@/components/crud";
import { useData } from "@/lib/use-data";

export default function EditNotePage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useData<LoveNote>("/notes");
  const note = data.find((item) => item.id === params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!note) return <ErrorState message="Note not found" />;

  return (
    <div>
      <PageHeader title="Edit love note" backHref="/notes" />
      <NoteForm note={note} />
    </div>
  );
}
