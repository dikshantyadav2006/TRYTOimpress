import type {
  Capsule,
  Compliment,
  DateIdea,
  Dream,
  GalleryImage,
  Letter,
  LoveNote,
  LovePromise,
  Memory,
  Page,
  Question,
  Reason,
  SiteSettings,
  Song,
  Surprise,
  Wish,
} from "@repo/shared";

const API_URL =
  process.env.API_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://trytotry.onrender.com"
    : "http://localhost:8000");

interface ApiEnvelope<T> {
  data: T;
}

class ContentUnavailableError extends Error {
  readonly status: number;

  constructor(path: string, status: number) {
    super(`Content unavailable (${path}): ${status}`);
    this.name = "ContentUnavailableError";
    this.status = status;
  }
}

async function fetchData<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new ContentUnavailableError(path, res.status);
  const body = (await res.json()) as ApiEnvelope<T>;
  return body.data;
}

function sitePath(slug: string, suffix: string): string {
  return `/sites/${encodeURIComponent(slug)}${suffix}`;
}

export async function getSiteSettings(slug: string): Promise<SiteSettings> {
  return fetchData<SiteSettings>(sitePath(slug, "/settings"));
}

export async function getPage(slug: string, pageSlug: string): Promise<Page | null> {
  try {
    return await fetchData<Page>(sitePath(slug, `/pages/${pageSlug}`));
  } catch (error) {
    if (error instanceof ContentUnavailableError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getMemories(slug: string): Promise<Memory[]> {
  return fetchData<Memory[]>(sitePath(slug, "/memories"));
}

export async function getGalleryImages(slug: string): Promise<GalleryImage[]> {
  return fetchData<GalleryImage[]>(sitePath(slug, "/gallery"));
}

export interface GalleryFeedResult {
  items: GalleryImage[];
  total: number;
  hasMore: boolean;
  nextPage: number | null;
}

export async function getGalleryFeed(
  slug: string,
  page: number,
  pageSize: number,
): Promise<GalleryFeedResult> {
  return fetchData<GalleryFeedResult>(sitePath(slug, `/gallery?page=${page}&pageSize=${pageSize}`));
}

export async function getQuestions(slug: string): Promise<Question[]> {
  return fetchData<Question[]>(sitePath(slug, "/questions"));
}

export async function getSongs(slug: string): Promise<Song[]> {
  return fetchData<Song[]>(sitePath(slug, "/songs"));
}

export async function getReasons(slug: string): Promise<Reason[]> {
  return fetchData<Reason[]>(sitePath(slug, "/reasons"));
}

export async function getDateIdeas(slug: string): Promise<DateIdea[]> {
  return fetchData<DateIdea[]>(sitePath(slug, "/dates"));
}

export async function getLetters(slug: string): Promise<Letter[]> {
  return fetchData<Letter[]>(sitePath(slug, "/letters"));
}

export async function getLoveNotes(slug: string): Promise<LoveNote[]> {
  return fetchData<LoveNote[]>(sitePath(slug, "/notes"));
}

export async function getCompliments(slug: string): Promise<Compliment[]> {
  return fetchData<Compliment[]>(sitePath(slug, "/compliments"));
}

export async function getWishes(slug: string): Promise<Wish[]> {
  return fetchData<Wish[]>(sitePath(slug, "/wishes"));
}

export async function getLovePromises(slug: string): Promise<LovePromise[]> {
  return fetchData<LovePromise[]>(sitePath(slug, "/promises"));
}

export async function getDreams(slug: string): Promise<Dream[]> {
  return fetchData<Dream[]>(sitePath(slug, "/dreams"));
}

export async function getCapsules(slug: string): Promise<Capsule[]> {
  return fetchData<Capsule[]>(sitePath(slug, "/capsules"));
}

export async function getSurprises(slug: string): Promise<Surprise[]> {
  return fetchData<Surprise[]>(sitePath(slug, "/surprises"));
}

export async function submitAnswer(
  slug: string,
  questionId: string,
  optionId: string,
): Promise<void> {
  const res = await fetch(`/api/sites/${encodeURIComponent(slug)}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, optionId }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new ContentUnavailableError("/sites/answers", res.status);
  }
}
