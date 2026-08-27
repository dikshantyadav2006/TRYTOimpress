export type MediaResourceType = "image" | "video" | "raw";

export interface Media {
  id: string;
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
  createdAt: string;
}
