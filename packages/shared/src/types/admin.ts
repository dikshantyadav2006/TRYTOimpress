export type AdminRole = "admin" | "editor";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  slug: string;
  role: AdminRole;
  createdAt: string;
}

export interface Site {
  slug: string;
  ownerId: string;
  name: string;
}
