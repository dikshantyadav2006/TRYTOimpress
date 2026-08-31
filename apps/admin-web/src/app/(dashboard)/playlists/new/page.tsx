import { PageHeader } from "@/components/crud";
import { PlaylistForm } from "@/components/playlist-form";

export default function NewPlaylistPage() {
  return (
    <div>
      <PageHeader title="New playlist" backHref="/playlists" />
      <PlaylistForm />
    </div>
  );
}