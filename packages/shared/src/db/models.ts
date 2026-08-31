import mongoose, { type Collection } from "mongoose";
import type { ObjectId } from "mongodb";

import type { GalleryCategory } from "../types/gallery";
import type { MediaResourceType } from "../types/media";
import type { ProposalStatus } from "../types/proposal";
import type { ProposalAnswer } from "../types/response";
import type { AdminRole } from "../types/admin";
import type { PageBlock, PageVisibility } from "../types/page";
import type { MusicMood } from "../types/playlist";
import type { SharePermission, ShareRole } from "../types/share";

export interface MemoryDoc {
  _id: ObjectId;
  ownerId: string;
  title: string;
  date: string;
  caption: string;
  imageId?: string;
  imageUrl?: string;
  order: number;
  createdAt: Date;
}

export interface GalleryImageDoc {
  _id: ObjectId;
  ownerId: string;
  caption: string;
  category: GalleryCategory;
  featured: boolean;
  order: number;
  registryId?: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface QuestionOptionDoc {
  id: string;
  label: string;
  emoji: string;
}

export interface QuestionDoc {
  _id: ObjectId;
  ownerId: string;
  title: string;
  subtitle: string;
  emoji: string;
  options: QuestionOptionDoc[];
  order: number;
  correctAnswerId?: string;
  imageId?: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface AnswerDoc {
  _id: ObjectId;
  ownerId: string;
  questionId: string;
  optionId: string;
  answeredAt: Date;
}

export interface MediaDoc {
  _id: ObjectId;
  ownerId: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
  resourceType: MediaResourceType;
  publicId?: string;
  width?: number;
  height?: number;
  duration?: number;
  fingerprint?: string;
  createdAt: Date;
}

export interface ProposalDoc {
  _id: ObjectId;
  ownerId: string;
  slug: string;
  title: string;
  message: string;
  subtitle?: string;
  imageUrl?: string;
  recipientName?: string;
  locale: string;
  status: ProposalStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProposalResponseDoc {
  _id: ObjectId;
  ownerId: string;
  proposalId: string;
  answer: ProposalAnswer;
  responderName?: string;
  respondedAt: Date;
}

export interface PageDoc {
  _id: ObjectId;
  ownerId: string;
  slug: string;
  title: string;
  subtitle?: string;
  heroImageUrl?: string;
  blocks: PageBlock[];
  cta?: { label: string; href: string } | null;
  order: number;
  visibility: PageVisibility;
  /** Legacy field from before three-state visibility; used as a fallback when `visibility` is missing. */
  published?: boolean;
  chapter?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteSettingsDoc {
  ownerId: string;
  recipientName: string;
  siteTitle: string;
  landing: {
    heroText: string;
    intro: string;
    ctaLabel: string;
    footer: string;
  };
  proposal: {
    title: string;
    message: string;
    hint: string;
    noLabels: string[];
    yesLabel: string;
  };
  success: {
    heading: string;
    messages: string[];
  };
  music: {
    backgroundAudioUrl: string;
    landingYoutubeId: string;
    questionsYoutubeId: string;
    proposalYoutubeId: string;
  };
  love: {
    startDate: string;
    startLabel: string;
  };
  birthday: {
    date: string;
    message: string;
  };
  navigation: {
    chaptersEnabled: boolean;
  };
  updatedAt: Date;
}

export interface AdminUserDoc {
  _id: ObjectId;
  name: string;
  email: string;
  slug: string;
  passwordHash: string;
  role: AdminRole;
  createdAt: Date;
}

export interface SessionDoc {
  _id: ObjectId;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface SongDoc {
  _id: ObjectId;
  ownerId: string;
  title: string;
  artist: string;
  youtubeId: string;
  note?: string;
  order: number;
  createdAt: Date;
}

export interface PlaylistSongDoc {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  duration?: number;
  mood?: MusicMood;
  note?: string;
  order: number;
  plays: number;
  skips: number;
}

export interface PlaylistThemeDoc {
  overlayColor: string;
  textColor: string;
  accentColor: string;
}

export interface PlaylistDoc {
  _id: ObjectId;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  backgrounds: string[];
  theme: PlaylistThemeDoc;
  quotes: string[];
  mood: MusicMood;
  recommendedSlugs?: string[];
  songs: PlaylistSongDoc[];
  plays: number;
  likes: number;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReasonDoc {
  _id: ObjectId;
  ownerId: string;
  emoji: string;
  title: string;
  detail: string;
  order: number;
  createdAt: Date;
}

export interface DateIdeaDoc {
  _id: ObjectId;
  ownerId: string;
  emoji: string;
  title: string;
  description: string;
  tag: string;
  order: number;
  createdAt: Date;
}

export interface LetterDoc {
  _id: ObjectId;
  ownerId: string;
  emoji: string;
  title: string;
  message: string;
  order: number;
  createdAt: Date;
}

export interface LoveNoteDoc {
  _id: ObjectId;
  ownerId: string;
  emoji: string;
  text: string;
  order: number;
  createdAt: Date;
}

export interface ComplimentDoc {
  _id: ObjectId;
  ownerId: string;
  emoji: string;
  text: string;
  order: number;
  createdAt: Date;
}

export interface WishDoc {
  _id: ObjectId;
  ownerId: string;
  emoji: string;
  text: string;
  order: number;
  createdAt: Date;
}

export interface LovePromiseDoc {
  _id: ObjectId;
  ownerId: string;
  emoji: string;
  title: string;
  text: string;
  order: number;
  createdAt: Date;
}

export interface DreamDoc {
  _id: ObjectId;
  ownerId: string;
  emoji: string;
  title: string;
  text: string;
  order: number;
  createdAt: Date;
}

export interface CapsuleDoc {
  _id: ObjectId;
  ownerId: string;
  emoji: string;
  title: string;
  message: string;
  unlockDate: string;
  order: number;
  createdAt: Date;
}

export interface SurpriseDoc {
  _id: ObjectId;
  ownerId: string;
  emoji: string;
  title: string;
  message: string;
  order: number;
  createdAt: Date;
}

export interface ShareLinkDoc {
  _id: ObjectId;
  ownerId: string;
  tokenHash: string;
  label: string;
  role: ShareRole;
  permissions: SharePermission[];
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
  lastUsedAt?: Date;
}

export const CollectionName = {
  Memories: "memories",
  GalleryImages: "galleryimages",
  Questions: "questions",
  Answers: "answers",
  Proposals: "proposals",
  ProposalResponses: "proposalresponses",
  Pages: "pages",
  SiteSettings: "sitesettings",
  AdminUsers: "adminusers",
  Sessions: "sessions",
  Media: "media",
  Songs: "songs",
  Playlists: "playlists",
  Reasons: "reasons",
  Dates: "dates",
  Letters: "letters",
  LoveNotes: "notes",
  Compliments: "compliments",
  Wishes: "wishes",
  LovePromises: "promises",
  Dreams: "dreams",
  Capsules: "capsules",
  Surprises: "surprises",
  ShareLinks: "sharelinks",
} as const;

export const memories = (): Collection<MemoryDoc> =>
  mongoose.connection.collection<MemoryDoc>(CollectionName.Memories);
export const galleryImages = (): Collection<GalleryImageDoc> =>
  mongoose.connection.collection<GalleryImageDoc>(CollectionName.GalleryImages);
export const questions = (): Collection<QuestionDoc> =>
  mongoose.connection.collection<QuestionDoc>(CollectionName.Questions);
export const answers = (): Collection<AnswerDoc> =>
  mongoose.connection.collection<AnswerDoc>(CollectionName.Answers);
export const proposals = (): Collection<ProposalDoc> =>
  mongoose.connection.collection<ProposalDoc>(CollectionName.Proposals);
export const proposalResponses = (): Collection<ProposalResponseDoc> =>
  mongoose.connection.collection<ProposalResponseDoc>(CollectionName.ProposalResponses);
export const pages = (): Collection<PageDoc> =>
  mongoose.connection.collection<PageDoc>(CollectionName.Pages);
export const siteSettings = (): Collection<SiteSettingsDoc> =>
  mongoose.connection.collection<SiteSettingsDoc>(CollectionName.SiteSettings);
export const adminUsers = (): Collection<AdminUserDoc> =>
  mongoose.connection.collection<AdminUserDoc>(CollectionName.AdminUsers);
export const sessions = (): Collection<SessionDoc> =>
  mongoose.connection.collection<SessionDoc>(CollectionName.Sessions);
export const media = (): Collection<MediaDoc> =>
  mongoose.connection.collection<MediaDoc>(CollectionName.Media);
export const songs = (): Collection<SongDoc> =>
  mongoose.connection.collection<SongDoc>(CollectionName.Songs);
export const playlists = (): Collection<PlaylistDoc> =>
  mongoose.connection.collection<PlaylistDoc>(CollectionName.Playlists);
export const reasons = (): Collection<ReasonDoc> =>
  mongoose.connection.collection<ReasonDoc>(CollectionName.Reasons);
export const dateIdeas = (): Collection<DateIdeaDoc> =>
  mongoose.connection.collection<DateIdeaDoc>(CollectionName.Dates);
export const letters = (): Collection<LetterDoc> =>
  mongoose.connection.collection<LetterDoc>(CollectionName.Letters);
export const loveNotes = (): Collection<LoveNoteDoc> =>
  mongoose.connection.collection<LoveNoteDoc>(CollectionName.LoveNotes);
export const compliments = (): Collection<ComplimentDoc> =>
  mongoose.connection.collection<ComplimentDoc>(CollectionName.Compliments);
export const wishes = (): Collection<WishDoc> =>
  mongoose.connection.collection<WishDoc>(CollectionName.Wishes);
export const lovePromises = (): Collection<LovePromiseDoc> =>
  mongoose.connection.collection<LovePromiseDoc>(CollectionName.LovePromises);
export const dreams = (): Collection<DreamDoc> =>
  mongoose.connection.collection<DreamDoc>(CollectionName.Dreams);
export const capsules = (): Collection<CapsuleDoc> =>
  mongoose.connection.collection<CapsuleDoc>(CollectionName.Capsules);
export const surprises = (): Collection<SurpriseDoc> =>
  mongoose.connection.collection<SurpriseDoc>(CollectionName.Surprises);
export const shareLinks = (): Collection<ShareLinkDoc> =>
  mongoose.connection.collection<ShareLinkDoc>(CollectionName.ShareLinks);
