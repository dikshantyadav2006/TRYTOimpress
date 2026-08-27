import type { GalleryImage } from "../types/gallery";
import type { Memory } from "../types/memory";
import { mockGalleryImages, mockMemories } from "../data/mock";

export interface ContentRepository {
  getMemories(ownerId: string): Promise<Memory[]>;
  getGalleryImages(ownerId: string): Promise<GalleryImage[]>;
}

export class MockContentRepository implements ContentRepository {
  private readonly memories: Memory[] = [...mockMemories];
  private readonly galleryImages: GalleryImage[] = [...mockGalleryImages];

  async getMemories(_ownerId: string): Promise<Memory[]> {
    return [...this.memories];
  }

  async getGalleryImages(_ownerId: string): Promise<GalleryImage[]> {
    return [...this.galleryImages];
  }
}
