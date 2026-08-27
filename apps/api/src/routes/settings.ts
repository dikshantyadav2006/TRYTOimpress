import type { FastifyInstance } from "fastify";
import type { ApiRepos } from "../repos";
import { requireAuth, requireEditRole } from "../auth";

export function registerSettingsRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const settings = repos.settings;
  if (!settings) return;
  const auth = repos.auth;

  app.get("/settings", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const current = await settings.getSettings(user.id);
    return { data: current };
  });

  app.put("/settings", async (request, reply) => {
    const access = await requireEditRole(auth, repos.share, request, reply);
    if (!access) return;
    const ownerId = access.ownerId;

    const current = await settings.getSettings(ownerId);
    if (!current) return reply.code(404).send({ error: "settings_not_seeded" });

    const body = (request.body ?? {}) as Record<string, unknown>;

    const update = {
      ...current,
      ...(typeof body.recipientName === "string"
        ? { recipientName: body.recipientName }
        : {}),
      ...(typeof body.siteTitle === "string" ? { siteTitle: body.siteTitle } : {}),
      landing: {
        ...current.landing,
        ...(body.landing && typeof body.landing === "object"
          ? (body.landing as Record<string, unknown>)
          : {}),
      },
      proposal: {
        ...current.proposal,
        ...(body.proposal && typeof body.proposal === "object"
          ? (body.proposal as Record<string, unknown>)
          : {}),
      },
      success: {
        ...current.success,
        ...(body.success && typeof body.success === "object"
          ? (body.success as Record<string, unknown>)
          : {}),
      },
      music: {
        ...current.music,
        ...(body.music && typeof body.music === "object"
          ? (body.music as Record<string, unknown>)
          : {}),
      },
      love: {
        ...current.love,
        ...(body.love && typeof body.love === "object"
          ? (body.love as Record<string, unknown>)
          : {}),
      },
    };

    const saved = await settings.upsertSettings(ownerId, update as never);
    return { data: saved };
  });
}
