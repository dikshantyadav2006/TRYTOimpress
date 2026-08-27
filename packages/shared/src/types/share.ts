export type ShareRole = "editor" | "viewer";

export const SHARE_PERMISSIONS = [
  "images.edit",
  "gallery.add",
] as const;

export type SharePermission = (typeof SHARE_PERMISSIONS)[number];

export interface ShareLink {
  id: string;
  ownerId: string;
  ownerSlug?: string;
  label: string;
  role: ShareRole;
  permissions: SharePermission[];
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
}

export interface ShareLinkInput {
  label: string;
  role: ShareRole;
  permissions?: SharePermission[];
  expiresAt?: string;
}

export interface ShareLinkCreated {
  link: ShareLink;
  token: string;
  slug: string;
}

export interface ShareSession {
  role: ShareRole | null;
  permissions: SharePermission[];
  ownerId?: string;
  slug?: string;
}
