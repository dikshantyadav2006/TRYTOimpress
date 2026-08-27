export type GalleryCategory = "moment" | "story" | "favourite";

export interface GalleryImage {
  id: string;
  caption: string;
  category: GalleryCategory;
  featured: boolean;
  order?: number;
  imageUrl?: string;
  createdAt: string;
}
