import type { ObjectId } from "mongodb";

import type { Capsule } from "../types/capsule";
import type { Compliment } from "../types/compliment";
import type { DateIdea } from "../types/date";
import type { Dream } from "../types/dream";
import type { GalleryImage } from "../types/gallery";
import type { Letter } from "../types/letter";
import type { LoveNote } from "../types/note";
import type { Media } from "../types/media";
import type { Memory } from "../types/memory";
import type { Page } from "../types/page";
import type { Proposal } from "../types/proposal";
import type { LovePromise } from "../types/promise";
import type { Answer, Question, QuestionOption } from "../types/question";
import type { Reason } from "../types/reason";
import type { ProposalResponse } from "../types/response";
import type { SiteSettings } from "../types/settings";
import type { AdminUser } from "../types/admin";
import type { Song } from "../types/song";
import type { Surprise } from "../types/surprise";
import type { Wish } from "../types/wish";
import {
  type AnswerDoc,
  type CapsuleDoc,
  type ComplimentDoc,
  type DateIdeaDoc,
  type DreamDoc,
  type GalleryImageDoc,
  type LetterDoc,
  type LoveNoteDoc,
  type LovePromiseDoc,
  type MediaDoc,
  type MemoryDoc,
  type PageDoc,
  type ProposalDoc,
  type ProposalResponseDoc,
  type QuestionDoc,
  type QuestionOptionDoc,
  type ReasonDoc,
  type SiteSettingsDoc,
  type AdminUserDoc,
  type SongDoc,
  type SurpriseDoc,
  type WishDoc,
} from "./models";

export function toId(value: ObjectId): string {
  return value.toString();
}

export function mapMemory(doc: MemoryDoc): Memory {
  return {
    id: toId(doc._id),
    title: doc.title,
    date: doc.date,
    caption: doc.caption,
    ...(doc.imageId ? { imageId: doc.imageId } : {}),
    ...(doc.imageUrl ? { imageUrl: doc.imageUrl } : {}),
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapGalleryImage(doc: GalleryImageDoc): GalleryImage {
  return {
    id: doc.registryId ?? toId(doc._id),
    caption: doc.caption,
    category: doc.category,
    featured: doc.featured,
    order: doc.order,
    ...(doc.imageUrl ? { imageUrl: doc.imageUrl } : {}),
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapOption(doc: QuestionOptionDoc): QuestionOption {
  return { id: doc.id, label: doc.label, emoji: doc.emoji };
}

export function mapQuestion(doc: QuestionDoc): Question {
  return {
    id: toId(doc._id),
    title: doc.title,
    subtitle: doc.subtitle,
    emoji: doc.emoji,
    options: doc.options.map(mapOption),
    order: doc.order,
    ...(doc.correctAnswerId ? { correctAnswerId: doc.correctAnswerId } : {}),
    ...(doc.imageId ? { imageId: doc.imageId } : {}),
    ...(doc.imageUrl ? { imageUrl: doc.imageUrl } : {}),
  };
}

export function mapMedia(doc: MediaDoc): Media {
  return {
    id: toId(doc._id),
    originalName: doc.originalName,
    size: doc.size,
    mimetype: doc.mimetype,
    url: doc.url,
    resourceType: doc.resourceType,
    ...(doc.publicId ? { publicId: doc.publicId } : {}),
    ...(doc.width !== undefined ? { width: doc.width } : {}),
    ...(doc.height !== undefined ? { height: doc.height } : {}),
    ...(doc.duration !== undefined ? { duration: doc.duration } : {}),
    ...(doc.fingerprint ? { fingerprint: doc.fingerprint } : {}),
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapAnswer(doc: AnswerDoc): Answer {  return {
    id: toId(doc._id),
    questionId: doc.questionId,
    optionId: doc.optionId,
    answeredAt: doc.answeredAt.toISOString(),
  };
}

export function mapProposal(doc: ProposalDoc): Proposal {
  return {
    id: toId(doc._id),
    slug: doc.slug,
    title: doc.title,
    message: doc.message,
    subtitle: doc.subtitle ?? "",
    imageUrl: doc.imageUrl ?? "",
    ...(doc.recipientName ? { recipientName: doc.recipientName } : {}),
    locale: doc.locale,
    status: doc.status,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function mapProposalResponse(doc: ProposalResponseDoc): ProposalResponse {
  return {
    id: toId(doc._id),
    proposalId: doc.proposalId,
    answer: doc.answer,
    ...(doc.responderName ? { responderName: doc.responderName } : {}),
    respondedAt: doc.respondedAt.toISOString(),
  };
}

export function mapPage(doc: PageDoc): Page {
  return {
    id: toId(doc._id),
    slug: doc.slug,
    title: doc.title,
    ...(doc.subtitle ? { subtitle: doc.subtitle } : {}),
    ...(doc.heroImageUrl ? { heroImageUrl: doc.heroImageUrl } : {}),
    blocks: doc.blocks.map((block) => ({ ...block })),
    ...(doc.cta ? { cta: { label: doc.cta.label, href: doc.cta.href } } : {}),
    order: doc.order,
    published: doc.published,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function mapSettings(doc: SiteSettingsDoc | null | undefined): SiteSettings | null {
  if (!doc) return null;
  return {
    recipientName: doc.recipientName,
    siteTitle: doc.siteTitle,
    landing: { ...doc.landing },
    proposal: {
      ...doc.proposal,
      noLabels: [...doc.proposal.noLabels],
    },
    success: { ...doc.success, messages: [...doc.success.messages] },
    music: {
      backgroundAudioUrl: doc.music?.backgroundAudioUrl ?? "",
      landingYoutubeId: doc.music?.landingYoutubeId ?? "",
      questionsYoutubeId: doc.music?.questionsYoutubeId ?? "",
      proposalYoutubeId: doc.music?.proposalYoutubeId ?? "",
    },
    love: {
      startDate: doc.love?.startDate ?? "",
      startLabel: doc.love?.startLabel ?? "the day we met",
    },
    birthday: {
      date: doc.birthday?.date ?? "",
      message: doc.birthday?.message ?? "",
    },
  };
}

export function mapReason(doc: ReasonDoc): Reason {
  return {
    id: toId(doc._id),
    emoji: doc.emoji,
    title: doc.title,
    detail: doc.detail,
    order: doc.order,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapDateIdea(doc: DateIdeaDoc): DateIdea {
  return {
    id: toId(doc._id),
    emoji: doc.emoji,
    title: doc.title,
    description: doc.description,
    tag: doc.tag,
    order: doc.order,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapLetter(doc: LetterDoc): Letter {
  return {
    id: toId(doc._id),
    emoji: doc.emoji,
    title: doc.title,
    message: doc.message,
    order: doc.order,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapLoveNote(doc: LoveNoteDoc): LoveNote {
  return {
    id: toId(doc._id),
    emoji: doc.emoji,
    text: doc.text,
    order: doc.order,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapCompliment(doc: ComplimentDoc): Compliment {
  return {
    id: toId(doc._id),
    emoji: doc.emoji,
    text: doc.text,
    order: doc.order,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapWish(doc: WishDoc): Wish {
  return {
    id: toId(doc._id),
    emoji: doc.emoji,
    text: doc.text,
    order: doc.order,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapLovePromise(doc: LovePromiseDoc): LovePromise {
  return {
    id: toId(doc._id),
    emoji: doc.emoji,
    title: doc.title,
    text: doc.text,
    order: doc.order,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapDream(doc: DreamDoc): Dream {
  return {
    id: toId(doc._id),
    emoji: doc.emoji,
    title: doc.title,
    text: doc.text,
    order: doc.order,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapCapsule(doc: CapsuleDoc): Capsule {
  return {
    id: toId(doc._id),
    emoji: doc.emoji,
    title: doc.title,
    message: doc.message,
    unlockDate: doc.unlockDate,
    order: doc.order,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapSurprise(doc: SurpriseDoc): Surprise {
  return {
    id: toId(doc._id),
    emoji: doc.emoji,
    title: doc.title,
    message: doc.message,
    order: doc.order,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapSong(doc: SongDoc): Song {
  return {
    id: toId(doc._id),
    title: doc.title,
    artist: doc.artist,
    youtubeId: doc.youtubeId,
    ...(doc.note ? { note: doc.note } : {}),
    order: doc.order,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapAdminUser(doc: AdminUserDoc): AdminUser {
  return {
    id: toId(doc._id),
    name: doc.name,
    email: doc.email,
    slug: doc.slug,
    role: doc.role,
    createdAt: doc.createdAt.toISOString(),
  };
}
