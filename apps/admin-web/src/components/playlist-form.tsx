"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";

import type { MusicMood, Playlist } from "@repo/shared";
import { parseYouTubeId, slugify } from "@repo/shared";
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

export const MOOD_OPTIONS: SegmentOption<MusicMood>[] = [
  { value: "love", label: "Love" },
  { value: "miss-you", label: "Miss you" },
  { value: "sad", label: "Sad" },
  { value: "rain", label: "Rainy" },
  { value: "night", label: "Late night" },
];

interface DraftSong {
  key: string;
  title: string;
  artist: string;
  youtubeInput: string;
  note: string;
  mood: MusicMood;
  order: number;
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
  const songCounter = useRef(playlist?.songs.length ?? 0);

  const [name, setName] = useState(playlist?.name ?? "");
  const [slug, setSlug] = useState(playlist?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(playlist?.description ?? "");
  const [coverImage, setCoverImage] = useState(playlist?.coverImage ?? "");
  const [backgrounds, setBackgrounds] = useState<string[]>(playlist?.backgrounds ?? []);
  const [overlayColor, setOverlayColor] = useState(playlist?.theme.overlayColor ?? "#000000");
  const [textColor, setTextColor] = useState(playlist?.theme.textColor ?? "#ffffff");
  const [accentColor, setAccentColor] = useState(playlist?.theme.accentColor ?? "#d4a373");
  const [quotes, setQuotes] = useState<string[]>(playlist?.quotes ?? []);
  const [mood, setMood] = useState<MusicMood>(playlist?.mood ?? "love");
  const [recommended, setRecommended] = useState<string[]>(playlist?.recommendedSlugs ?? []);
  const [published, setPublished] = useState(playlist?.published ?? true);
  const [order, setOrder] = useState(playlist?.order !== undefined ? String(playlist.order) : "");
  const [songs, setSongs] = useState<DraftSong[]>(
    playlist?.songs.map((song) => ({
      key: `song-${songCounter.current++}`,
      title: song.title,
      artist: song.artist,
      youtubeInput: song.youtubeId,
      note: song.note ?? "",
      mood: song.mood ?? "love",
      order: song.order,
    })) ?? [],
  );
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useDirtyGuard({
    name,
    slug,
    description,
    coverImage,
    backgrounds,
    overlayColor,
    textColor,
    accentColor,
    quotes,
    mood,
    recommended,
    published,
    order,
    songs,
  });

  const onNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const addSong = () => {
    songCounter.current += 1;
    setSongs((current) => [
      ...current,
      {
        key: `song-${songCounter.current}`,
        title: "",
        artist: "",
        youtubeInput: "",
        note: "",
        mood: "love",
        order: current.length + 1,
      },
    ]);
  };

  const updateSong = (key: string, patch: Partial<DraftSong>) =>
    setSongs((current) => current.map((song) => (song.key === key ? { ...song, ...patch } : song)));

  const removeSong = (key: string) =>
    setSongs((current) => current.filter((song) => song.key !== key));

  const updateQuote = (index: number, value: string) =>
    setQuotes((current) => current.map((quote, i) => (i === index ? value : quote)));

  const toggleRecommended = (playlistSlug: string) =>
    setRecommended((current) =>
      current.includes(playlistSlug)
        ? current.filter((item) => item !== playlistSlug)
        : [...current, playlistSlug],
    );

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);

    const songPayload: {
      title: string;
      artist: string;
      youtubeId: string;
      note?: string;
      mood?: MusicMood;
      order: number;
    }[] = [];
    for (const song of songs) {
      if (!song.title.trim() && !song.artist.trim() && !song.youtubeInput.trim()) continue;
      if (!song.title.trim() || !song.artist.trim()) {
        setError("Every song needs a title and artist.");
        setLoading(false);
        return;
      }
      const youtubeId = parseYouTubeId(song.youtubeInput.trim());
      if (!youtubeId) {
        setError(`Invalid YouTube link for “${song.title.trim()}”.`);
        setLoading(false);
        return;
      }
      songPayload.push({
        title: song.title.trim(),
        artist: song.artist.trim(),
        youtubeId,
        ...(song.note.trim() ? { note: song.note.trim() } : {}),
        ...(song.mood ? { mood: song.mood } : {}),
        order: song.order,
      });
    }

    const body = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(coverImage ? { coverImage } : {}),
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
        <div>
          <Label>Mood</Label>
          <SegmentedControl name="mood" options={MOOD_OPTIONS} value={mood} onChange={setMood} />
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

      <SectionCard title="Songs" description="Tracks that play in this playlist.">
        <div className="space-y-4">
          {songs.map((song) => (
            <div key={song.key} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  Song
                </p>
                <button
                  type="button"
                  onClick={() => removeSong(song.key)}
                  aria-label="Remove song"
                  className="text-muted-foreground hover:text-rose-300 rounded-lg p-1.5 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`${song.key}-title`}>Title</Label>
                  <Input
                    id={`${song.key}-title`}
                    value={song.title}
                    onChange={(event) => updateSong(song.key, { title: event.target.value })}
                    placeholder="Perfect"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`${song.key}-artist`}>Artist</Label>
                  <Input
                    id={`${song.key}-artist`}
                    value={song.artist}
                    onChange={(event) => updateSong(song.key, { artist: event.target.value })}
                    placeholder="Ed Sheeran"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`${song.key}-youtube`}>YouTube link or video ID</Label>
                <Input
                  id={`${song.key}-youtube`}
                  value={song.youtubeInput}
                  onChange={(event) => updateSong(song.key, { youtubeInput: event.target.value })}
                  placeholder="https://www.youtube.com/watch?v=…"
                  required
                />
              </div>
              <div>
                <Label htmlFor={`${song.key}-note`}>Note (optional)</Label>
                <Input
                  id={`${song.key}-note`}
                  value={song.note}
                  onChange={(event) => updateSong(song.key, { note: event.target.value })}
                  placeholder="Why this song is ours…"
                />
              </div>
              <div>
                <Label>Mood</Label>
                <SegmentedControl
                  name={`${song.key}-mood`}
                  options={MOOD_OPTIONS}
                  size="sm"
                  value={song.mood}
                  onChange={(value) => updateSong(song.key, { mood: value })}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSong}
          className="hover:border-rose-300/40 hover:bg-white/[0.06] inline-flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white/85 transition-colors"
        >
          <Plus className="h-4 w-4 text-rose-300" />
          Add song
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