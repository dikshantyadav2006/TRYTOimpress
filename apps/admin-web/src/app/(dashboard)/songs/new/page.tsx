import { PageHeader } from "@/components/crud";
import { SongForm } from "@/components/song-form";

export default function NewSongPage() {
  return (
    <div>
      <PageHeader title="New song" backHref="/songs" />
      <SongForm />
    </div>
  );
}
