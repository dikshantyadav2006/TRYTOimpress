"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

import type { MusicMood, Playlist, PlaylistMode } from "@repo/shared";
import { slugify } from "@repo/shared";
import { cn } from "@repo/ui";

import { useDirtyGuard } from "@/components/dirty-guard";
import { UploadField } from "@/components/upload-field";
import {
  Badge,
  FormFooter,
  Input,
  Label,
  SectionCard,
  SegmentedControl,
  Switch,
  Textarea,
  type SegmentOption,
} from "@/components/ui";
import { ApiError, post, put } from "@/lib/api";
import { useData } from "@/lib/use-data";
import { getYouTubeThumbnail } from "@repo/shared";

export const MOOD_OPTIONS: SegmentOption<MusicMood>[] = [
  { value: "love", label: "Love" },
  { value: "miss-you", label: "Miss you" },
  { value: "sad", label: "Sad" },
  { value: "rain", label: "Rainy" },
  { value: "night", label: "Late night" },
];

const MODE_OPTIONS: SegmentOption<PlaylistMode>[] = [
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
];

interface ImportedTrack {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  thumbnail?: string;
  duration?: number;
}

interface DraftTrack {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  thumbnail?: string;
  duration?: number;
  note: string;
  mood: MusicMood;
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          className="border-white/10 h-11 w-14 shrink-0 cursor-pointer rounded-lg border bg-white/5 p-1"
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="font-mono uppercase"
        />
      </div>
    </div>
  );
}

export function PlaylistForm({ playlist }: { playlist?: Playlist | null }) {
  const router = useRouter();
  const isEdit = Boolean(playlist);
  const { data: allPlaylists } = useData<Playlist>("/playlists");

  const [name, setName] = useState(playlist?.name ?? "");
  const [slug, setSlug] = useState(playlist?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(playlist?.description ?? "");
  const [coverImage, setCoverImage] = useState(playlist?.coverImage ?? "");
  const [mode, setMode] = useState<PlaylistMode>(playlist?.mode ?? "video");
  const [provider, setProvider] = useState<Playlist["provider"]>(playlist?.provider ?? "manual");
  const [providerPlaylistId, setProviderPlaylistId] = useState<string | undefined>(
    playlist?.providerPlaylistId,
  );
  const [sourceUrl, setSourceUrl] = useState<string | undefined>(playlist?.sourceUrl);
  const [backgrounds, setBackgrounds] = useState<string[]>(playlist?.backgrounds ?? []);
  const [overlayColor, setOverlayColor] = useState(playlist?.theme.overlayColor ?? "#000000");
  const [textColor, setTextColor] = useState(playlist?.theme.textColor ?? "#ffffff");
  const [accentColor, setAccentColor] = useState(playlist?.theme.accentColor ?? "#d4a373");
  const [quotes, setQuotes] = useState<string[]>(playlist?.quotes ?? []);
  const [mood, setMood] = useState<MusicMood>(playlist?.mood ?? "love");
  const [recommended, setRecommended] = useState<string[]>(playlist?.recommendedSlugs ?? []);
  const [published, setPublished] = useState(playlist?.published ?? true);
  const [order, setOrder] = useState(playlist?.order !== undefined ? String(playlist.order) : "");
  const [tracks, setTracks] = useState<DraftTrack[]>(
    playlist?.songs.map((song) => {
      const track: DraftTrack = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        youtubeId: song.youtubeId,
        note: song.note ?? "",
        mood: song.mood ?? "love",
      };
      if (song.thumbnail) track.thumbnail = song.thumbnail;
      if (song.duration) track.duration = song.duration;
      return track;
    }) ?? [],
  );

  const [importUrl, setImportUrl] = useState("");
  const [importMode, setImportMode] = useState<PlaylistMode>("video");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string>();

  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useDirtyGuard({
    name,
    slug,
    description,
    coverImage,
    mode,
    provider,
    providerPlaylistId,
    sourceUrl,
    backgrounds,
    overlayColor,
    textColor,
    accentColor,
    quotes,
    mood,
    recommended,
    published,
    order,
    tracks,
  });

  const onNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const onImport = async () => {
    const url = importUrl.trim();
    if (!url) return;
    setImporting(true);
    setImportError(undefined);
    try {
      const result = await post<{
        name: string;
        description?: string;
        coverImage?: string;
        mode: PlaylistMode;
        provider: string;
        providerPlaylistId?: string;
        songs: ImportedTrack[];
      }>("/playlists/import", { url });
      if (result.songs.length === 0) {
        setImportError("No tracks found in that playlist.");
        return;
      }
      if (!name.trim()) setName(result.name);
      if (!description.trim() && result.description) setDescription(result.description);
      if (!coverImage && result.coverImage) setCoverImage(result.coverImage);
      setMode(importMode);
      setProvider("youtube");
      setProviderPlaylistId(result.providerPlaylistId);
      setSourceUrl(url);
      setTracks(
        result.songs.map((song) => {
          const track: DraftTrack = {
            id: song.id,
            title: song.title,
            artist: song.artist,
            youtubeId: song.youtubeId,
            note: "",
            mood,
          };
          if (song.thumbnail) track.thumbnail = song.thumbnail;
          if (song.duration) track.duration = song.duration;
          return track;
        }),
      );
    } catch (err) {
      setImportError(err instanceof ApiError ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const addTrack = () => {
    setTracks((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        title: "",
        artist: "",
        youtubeId: "",
        note: "",
        mood,
      },
    ]);
  };

  const updateTrack = (id: string, patch: Partial<DraftTrack>) =>
    setTracks((current) =>
      current.map((track) => (track.id === id ? { ...track, ...patch } : track)),
    );

  const removeTrack = (id: string) => setTracks((current) => current.filter((t) => t.id !== id));

  const updateQuote = (index: number, value: string) =>
    setQuotes((current) => current.map((quote, i) => (i === index ? value : quote)));

  const toggleRecommended = (playlistSlug: string) =>
    setRecommended((current) =>
      current.includes(playlistSlug)
        ? current.filter((item) => item !== playlistSlug)
        : [...current, playlistSlug],
    );

  const onThumbnailChange = (id: string, youtubeId: string) => {
    const trimmed = youtubeId.trim();
    if (!trimmed) {
      updateTrack(id, { youtubeId });
      return;
    }
    updateTrack(id, { youtubeId: trimmed, thumbnail: getYouTubeThumbnail(trimmed) });
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);

    const songPayload: {
      title: string;
      artist: string;
      youtubeId: string;
      thumbnail?: string;
      duration?: number;
      note?: string;
      mood?: MusicMood;
      order: number;
    }[] = [];
    let index = 0;
    for (const track of tracks) {
      if (!track.title.trim() && !track.artist.trim() && !track.youtubeId.trim()) continue;
      if (!track.title.trim() || !track.artist.trim() || !track.youtubeId.trim()) {
        setError("Every track needs a title, artist and YouTube link.");
        setLoading(false);
        return;
      }
      songPayload.push({
        title: track.title.trim(),
        artist: track.artist.trim(),
        youtubeId: track.youtubeId.trim(),
        ...(track.thumbnail ? { thumbnail: track.thumbnail } : {}),
        ...(track.duration ? { duration: track.duration } : {}),
        ...(track.note.trim() ? { note: track.note.trim() } : {}),
        ...(track.mood ? { mood: track.mood } : {}),
        order: index,
      });
      index += 1;
    }

    const body = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(coverImage ? { coverImage } : {}),
      mode,
      provider: sourceUrl ? "youtube" : provider,
      ...(providerPlaylistId ? { providerPlaylistId } : {}),
      ...(sourceUrl ? { sourceUrl } : {}),
      backgrounds,
      theme: { overlayColor, textColor, accentColor },
      quotes: quotes.map((quote) => quote.trim()).filter(Boolean),
      mood,
      recommendedSlugs: recommended,
      songs: songPayload,
      ...(order !== "" ? { order: Number(order) } : {}),
      published,
    };

    try {
      if (isEdit && playlist) {
        await put(`/playlists/${playlist.id}`, body);
      } else {
        await post("/playlists", body);
      }
      router.push("/playlists");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <SectionCard title="Details" description="What this playlist is about.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Miss You"
              required
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              placeholder="miss-you"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Songs that make me think of every goodnight that turns into a good morning."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="mode">Player mode</Label>
            <SegmentedControl name="mode" options={MODE_OPTIONS} value={mode} onChange={setMode} />
            <p className="mt-1.5 text-xs text-white/40">
              Audio renders a cover-art player with no video. Video renders the playback.
            </p>
          </div>
          <div>
            <Label>Mood</Label>
            <SegmentedControl name="mood" options={MOOD_OPTIONS} value={mood} onChange={setMood} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              value={order}
              onChange={(event) => setOrder(event.target.value)}
              placeholder="1"
            />
          </div>
          <div className="flex items-end gap-3 pb-1">
            <Label className="mb-0">Published</Label>
            <Switch checked={published} onChange={setPublished} label="Published" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Playlist source" description="Paste a YouTube playlist URL. Tracks are fetched live from this source at runtime, so no manual import is required.">
        <div className="space-y-3">
          <div>
            <Label htmlFor="source-url">Playlist URL</Label>
            <Input
              id="source-url"
              value={importUrl}
              onChange={(event) => {
                setImportUrl(event.target.value);
                if (event.target.value.trim()) setSourceUrl(event.target.value.trim());
              }}
              placeholder="https://www.youtube.com/playlist?list=…"
            />
          </div>
          <div>
            <Label>Player mode for this source</Label>
            <SegmentedControl
              name="import-mode"
              options={MODE_OPTIONS}
              size="sm"
              value={importMode}
              onChange={setImportMode}
            />
          </div>
          {importError && <p className="text-sm text-rose-300">{importError}</p>}
          <button
            type="button"
            onClick={() => void onImport()}
            disabled={!importUrl.trim() || importing}
            className="hover:border-rose-300/40 hover:bg-white/[0.06] inline-flex h-10 items-center gap-2 rounded-full border border-rose-300/30 bg-rose-500/10 px-5 text-sm font-medium text-rose-100 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {importing ? "Prefetching…" : "Prefetch tracks"}
          </button>
          <p className="text-xs leading-relaxed text-white/40">
            Optional: prefetch reads the track list now so it&apos;s cached before saving. You can
            save with just a source URL — the player will fetch fresh tracks at runtime.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Cover & backgrounds" description="The cover shows in the hub; backgrounds are used in the fullscreen player.">
        <div>
          <Label>Cover image</Label>
          <UploadField value={coverImage} onChange={setCoverImage} accept="image/*" />
        </div>
        <div className="space-y-3">
          <Label>Backgrounds</Label>
          {backgrounds.map((url, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <UploadField value={url} onChange={(next) => setBackgrounds((current) => current.map((bg, i) => (i === index ? next : bg)))} accept="image/*" />
              </div>
              <button
                type="button"
                onClick={() => setBackgrounds((current) => current.filter((_, i) => i !== index))}
                aria-label="Remove background"
                className="text-muted-foreground hover:text-rose-300 mt-3 shrink-0 rounded-lg p-2 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setBackgrounds((current) => [...current, ""])}
            className="hover:border-rose-300/40 hover:bg-white/[0.06] inline-flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white/85 transition-colors"
          >
            <Plus className="h-4 w-4 text-rose-300" />
            Add background
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Theme" description="Colors used by the immersive player.">
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorField label="Overlay" value={overlayColor} onChange={setOverlayColor} />
          <ColorField label="Text" value={textColor} onChange={setTextColor} />
          <ColorField label="Accent" value={accentColor} onChange={setAccentColor} />
        </div>
      </SectionCard>

      <SectionCard title="Quotes" description="Caption lines shown on each visit to the playlist.">
        {quotes.map((quote, index) => (
          <div key={index} className="flex items-start gap-2">
            <Textarea
              value={quote}
              onChange={(event) => updateQuote(index, event.target.value)}
              className="min-h-20"
              placeholder="“Missing you is a way of loving you.”"
            />
            <button
              type="button"
              onClick={() => setQuotes((current) => current.filter((_, i) => i !== index))}
              aria-label="Remove quote"
              className="text-muted-foreground hover:text-rose-300 rounded-lg p-2 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setQuotes((current) => [...current, ""])}
          className="hover:border-rose-300/40 hover:bg-white/[0.06] inline-flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white/85 transition-colors"
        >
          <Plus className="h-4 w-4 text-rose-300" />
          Add quote
        </button>
      </SectionCard>

      <SectionCard
        title="Tracks"
        description="Fetched live from the source URL at runtime. You can still review, add or remove rows before saving; these act as a cached fallback."
      >
        <div className="space-y-4">
          {tracks.length === 0 && (
            <p className="text-muted-foreground rounded-xl border border-dashed border-white/10 p-5 text-center text-sm">
              No cached tracks yet. Paste a source URL above (optionally prefetch), or add one
              manually.
            </p>
          )}
          {tracks.map((track, index) => (
            <div key={track.id} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {track.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={track.thumbnail}
                      alt=""
                      className="h-12 w-16 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="bg-white/5 h-12 w-16 shrink-0 rounded-lg" />
                  )}
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      Track {index + 1}
                    </p>
                    {track.duration ? (
                      <p className="text-xs text-white/40">{formatDuration(track.duration)}</p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeTrack(track.id)}
                  aria-label="Remove track"
                  className="text-muted-foreground hover:text-rose-300 rounded-lg p-1.5 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`${track.id}-title`}>Title</Label>
                  <Input
                    id={`${track.id}-title`}
                    value={track.title}
                    onChange={(event) => updateTrack(track.id, { title: event.target.value })}
                    placeholder="Perfect"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`${track.id}-artist`}>Artist</Label>
                  <Input
                    id={`${track.id}-artist`}
                    value={track.artist}
                    onChange={(event) => updateTrack(track.id, { artist: event.target.value })}
                    placeholder="Ed Sheeran"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`${track.id}-youtube`}>YouTube video ID or link</Label>
                <Input
                  id={`${track.id}-youtube`}
                  value={track.youtubeId}
                  onChange={(event) => onThumbnailChange(track.id, event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…"
                  required
                />
              </div>
              <div>
                <Label htmlFor={`${track.id}-note`}>Note (optional)</Label>
                <Input
                  id={`${track.id}-note`}
                  value={track.note}
                  onChange={(event) => updateTrack(track.id, { note: event.target.value })}
                  placeholder="Why this song is ours…"
                />
              </div>
              <div>
                <Label>Mood</Label>
                <SegmentedControl
                  name={`${track.id}-mood`}
                  options={MOOD_OPTIONS}
                  size="sm"
                  value={track.mood}
                  onChange={(value) => updateTrack(track.id, { mood: value })}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addTrack}
          className="hover:border-rose-300/40 hover:bg-white/[0.06] inline-flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white/85 transition-colors"
        >
          <Plus className="h-4 w-4 text-rose-300" />
          Add track manually
        </button>
      </SectionCard>

      <SectionCard title="Recommendations" description="Other playlists suggested on this playlist's page.">
        <div className="flex flex-wrap gap-2">
          {allPlaylists.filter((item) => item.id !== playlist?.id).length === 0 ? (
            <p className="text-muted-foreground text-sm">Create more playlists to suggest.</p>
          ) : (
            allPlaylists
              .filter((item) => item.id !== playlist?.id)
              .map((item) => {
                const selected = recommended.includes(item.slug);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleRecommended(item.slug)}
                    className={cn(
                      "hover:border-rose-300/40 inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                      selected
                        ? "border-rose-300/50 bg-rose-500/15 text-rose-200"
                        : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]",
                    )}
                  >
                    {selected ? "✓" : "＋"} {item.name}
                  </button>
                );
              })
          )}
        </div>
        {recommended.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recommended.map((item) => (
              <Badge key={item} tone="rose">
                {item}
              </Badge>
            ))}
          </div>
        )}
      </SectionCard>

      <FormFooter loading={loading} error={error} submitLabel={isEdit ? "Save changes" : "Create playlist"} />
    </form>
  );
}
