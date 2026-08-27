import type { GalleryImage } from "../types/gallery";
import type { Memory } from "../types/memory";
import type { ContentRepository } from "../repositories/content.repository";
import { MockContentRepository } from "../repositories/content.repository";

export interface ContentService {
  getMemories(ownerId: string): Promise<Memory[]>;
  getGalleryImages(ownerId: string): Promise<GalleryImage[]>;
}

export class ContentServiceImplementation implements ContentService {
  constructor(private readonly repository: ContentRepository) {}

  async getMemories(ownerId: string): Promise<Memory[]> {
    return this.repository.getMemories(ownerId);
  }

  async getGalleryImages(ownerId: string): Promise<GalleryImage[]> {
    return this.repository.getGalleryImages(ownerId);
  }
}

export function createContentService(
  repository: ContentRepository = new MockContentRepository(),
): ContentService {
  return new ContentServiceImplementation(repository);
}
