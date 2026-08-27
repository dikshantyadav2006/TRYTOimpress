import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  AdminUser,
  SharePermission,
  ShareRole,
} from "@repo/shared";
import type {
  MongoAuthRepository,
  MongoShareLinkRepository,
} from "@repo/shared/db";

export const SESSION_COOKIE = "admin_session";
export const SHARE_COOKIE = "share_session";

export type EditAccess =
  | { kind: "admin"; user: AdminUser; ownerId: string }
  | { kind: "share"; role: ShareRole; permissions: SharePermission[]; ownerId: string };

export function editOwnerId(access: EditAccess): string {
  return access.ownerId;
}

export async function resolveUser(
  auth: MongoAuthRepository | null,
  request: FastifyRequest,
): Promise<AdminUser | null> {
  if (!auth) return null;
  const token = request.cookies[SESSION_COOKIE];
  if (!token) return null;
  return auth.getUserBySessionToken(token);
}

export async function requireAuth(
  auth: MongoAuthRepository | null,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<AdminUser | null> {
  if (!auth) {
    await reply.code(503).send({ error: "db_not_configured" });
    return null;
  }
  const user = await resolveUser(auth, request);
  if (!user) {
    await reply.code(401).send({ error: "unauthorized" });
    return null;
  }
  return user;
}

export function requireRole(
  user: AdminUser,
  role: "admin" | "editor",
): boolean {
  return user.role === "admin" || user.role === role;
}

export async function resolveShareAccess(
  share: MongoShareLinkRepository,
  request: FastifyRequest,
): Promise<{ role: ShareRole; permissions: SharePermission[]; ownerId: string } | null> {
  const token = request.cookies[SHARE_COOKIE];
  if (!token) return null;
  const link = await share.findByToken(token);
  if (!link) return null;
  await share.touch(link._id.toString());
  return {
    role: link.role,
    permissions: [...link.permissions],
    ownerId: link.ownerId,
  };
}

export async function resolveEditAccess(
  auth: MongoAuthRepository | null,
  share: MongoShareLinkRepository | null,
  request: FastifyRequest,
): Promise<EditAccess | null> {
  if (auth) {
    const user = await resolveUser(auth, request);
    if (user) return { kind: "admin", user, ownerId: user.id };
  }
  if (share) {
    const access = await resolveShareAccess(share, request);
    if (access) return { kind: "share", ...access };
  }
  return null;
}

export async function requireEditRole(
  auth: MongoAuthRepository | null,
  share: MongoShareLinkRepository | null,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<EditAccess | null> {
  const access = await resolveEditAccess(auth, share, request);
  if (!access) {
    await reply.code(401).send({ error: "unauthorized" });
    return null;
  }
  if (access.kind === "share" && access.role !== "editor") {
    await reply.code(403).send({ error: "forbidden" });
    return null;
  }
  return access;
}
