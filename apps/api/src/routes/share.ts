import type { FastifyInstance } from "fastify";
import type { ShareLinkInput, SharePermission, ShareRole } from "@repo/shared";
import { generateShareToken } from "@repo/shared/db";

import type { ApiRepos } from "../repos";
import { requireAuth, SHARE_COOKIE } from "../auth";

export function registerShareRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const share = repos.share;
  const auth = repos.auth;
  if (!share) return;

  app.post("/share-links", async (request, reply) => {
    if (!auth) return reply.code(503).send({ error: "auth_not_configured" });
    const user = await requireAuth(auth, request, reply);
    if (!user) return;

    const body = (request.body ?? {}) as {
      label?: string;
      role?: string;
      permissions?: unknown;
      expiresAt?: string;
      userId?: string;
    };

    const label = (body.label ?? "").trim();
    if (!label) return reply.code(400).send({ error: "label_required" });

    let ownerId = user.id;
    if (body.userId) {
      if (user.role !== "admin") {
        return reply.code(403).send({ error: "forbidden" });
      }
      const target = await auth.findById(body.userId);
      if (!target) return reply.code(404).send({ error: "user_not_found" });
      ownerId = target.id;
    }

    const role: ShareRole = body.role === "viewer" ? "viewer" : "editor";
    const input: ShareLinkInput = { label, role };
    if (Array.isArray(body.permissions) && body.permissions.length > 0) {
      input.permissions = body.permissions as SharePermission[];
    }
    if (typeof body.expiresAt === "string" && body.expiresAt.trim()) {
      input.expiresAt = body.expiresAt.trim();
    }

    const token = generateShareToken();
    const link = await share.createLink(input, user.id, ownerId, token);
    return reply.code(201).send({ data: { link, token } });
  });

  app.get("/share-links", async (request, reply) => {
    if (!auth) return reply.code(503).send({ error: "auth_not_configured" });
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const links = user.role === "admin" ? await share.listLinks() : await share.listLinks(user.id);
    return { data: links };
  });

  app.delete<{ Params: { id: string } }>("/share-links/:id", async (request, reply) => {
    if (!auth) return reply.code(503).send({ error: "auth_not_configured" });
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = user.role === "admin"
      ? await share.deleteLink(request.params.id)
      : await share.deleteLink(request.params.id, user.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });

  async function shareSession(token: string) {
    if (!share) return null;
    const link = await share.findByToken(token);
    if (!link) return null;
    await share.touch(link._id.toString());
    const owner = auth ? await auth.findById(link.ownerId) : null;
    return {
      role: link.role,
      permissions: link.permissions,
      slug: owner?.slug ?? null,
      ownerId: link.ownerId,
    };
  }

  app.get("/share/:token", async (request, reply) => {
    const { token } = request.params as { token: string };
    const session = await shareSession(token);
    if (!session) return reply.code(404).send({ error: "invalid_or_expired" });
    return { data: session };
  });

  app.get("/share/session", async (request) => {
    const token = request.cookies[SHARE_COOKIE];
    if (!token) return { data: { role: null, permissions: [] } };
    const session = await shareSession(token);
    if (!session) return { data: { role: null, permissions: [] } };
    return { data: session };
  });
}
