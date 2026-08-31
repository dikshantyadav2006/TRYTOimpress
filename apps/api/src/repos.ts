import {
  MongoAuthRepository,
  MongoCapsuleRepository,
  MongoComplimentRepository,
  MongoContentRepository,
  MongoDateIdeaRepository,
  MongoDreamRepository,
  MongoLetterRepository,
  MongoLoveNoteRepository,
  MongoLovePromiseRepository,
  MongoMediaRepository,
  MongoPageRepository,
  MongoPlaylistRepository,
  MongoProposalRepository,
  MongoQuestionRepository,
  MongoReasonRepository,
  MongoSettingsRepository,
  MongoSongRepository,
  MongoSurpriseRepository,
  MongoWishRepository,
  MongoShareLinkRepository,
} from "@repo/shared/db";
import { MockProposalRepository } from "@repo/shared";
import { isDbConfigured } from "./db";

export interface ApiRepos {
  content: MongoContentRepository | null;
  questions: MongoQuestionRepository | null;
  proposals: MongoProposalRepository | MockProposalRepository;
  settings: MongoSettingsRepository | null;
  pages: MongoPageRepository | null;
  auth: MongoAuthRepository | null;
  media: MongoMediaRepository | null;
  songs: MongoSongRepository | null;
  playlists: MongoPlaylistRepository | null;
  reasons: MongoReasonRepository | null;
  dates: MongoDateIdeaRepository | null;
  letters: MongoLetterRepository | null;
  notes: MongoLoveNoteRepository | null;
  compliments: MongoComplimentRepository | null;
  wishes: MongoWishRepository | null;
  promises: MongoLovePromiseRepository | null;
  dreams: MongoDreamRepository | null;
  capsules: MongoCapsuleRepository | null;
  surprises: MongoSurpriseRepository | null;
  share: MongoShareLinkRepository | null;
}

export function createRepos(): ApiRepos {
  const useDb = isDbConfigured();
  return {
    content: useDb ? new MongoContentRepository() : null,
    questions: useDb ? new MongoQuestionRepository() : null,
    proposals: useDb ? new MongoProposalRepository() : new MockProposalRepository(),
    settings: useDb ? new MongoSettingsRepository() : null,
    pages: useDb ? new MongoPageRepository() : null,
    auth: useDb ? new MongoAuthRepository() : null,
    media: useDb ? new MongoMediaRepository() : null,
    songs: useDb ? new MongoSongRepository() : null,
    playlists: useDb ? new MongoPlaylistRepository() : null,
    reasons: useDb ? new MongoReasonRepository() : null,
    dates: useDb ? new MongoDateIdeaRepository() : null,
    letters: useDb ? new MongoLetterRepository() : null,
    notes: useDb ? new MongoLoveNoteRepository() : null,
    compliments: useDb ? new MongoComplimentRepository() : null,
    wishes: useDb ? new MongoWishRepository() : null,
    promises: useDb ? new MongoLovePromiseRepository() : null,
    dreams: useDb ? new MongoDreamRepository() : null,
    capsules: useDb ? new MongoCapsuleRepository() : null,
    surprises: useDb ? new MongoSurpriseRepository() : null,
    share: useDb ? new MongoShareLinkRepository() : null,
  };
}
