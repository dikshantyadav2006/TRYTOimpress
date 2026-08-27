import { ObjectId } from "mongodb";

import {
  adminUsers,
  answers,
  capsules,
  compliments,
  dateIdeas,
  dreams,
  galleryImages,
  letters,
  loveNotes,
  lovePromises,
  media,
  memories,
  pages,
  proposals,
  proposalResponses,
  questions,
  reasons,
  shareLinks,
  siteSettings,
  sessions,
  songs,
  surprises,
  wishes,
} from "./models";

const SITE_COLLECTIONS = [
  memories,
  galleryImages,
  questions,
  answers,
  proposals,
  proposalResponses,
  pages,
  siteSettings,
  songs,
  reasons,
  dateIdeas,
  letters,
  loveNotes,
  compliments,
  wishes,
  lovePromises,
  dreams,
  capsules,
  surprises,
  shareLinks,
  media,
];

export async function deleteSiteData(ownerId: string): Promise<void> {
  for (const collection of SITE_COLLECTIONS) {
    await collection().deleteMany({ ownerId });
  }
  await sessions().deleteMany({ userId: ownerId });
  await adminUsers().deleteOne({ _id: new ObjectId(ownerId) });
}
