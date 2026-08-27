import type { FastifyInstance } from "fastify";
import type { ApiRepos } from "../repos";
import { requireAuth } from "../auth";

export function registerCapsuleRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const capsules = repos.capsules;
  if (!capsules) return;
  const auth = repos.auth;

  app.get("/capsules", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await capsules.getCapsules(user.id) };
  });

  app.post("/capsules", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as {
      emoji?: string;
      title?: string;
      message?: string;
      unlockDate?: string;
      order?: number;
    };
    if (!body.title || !body.message) {
      return reply.code(400).send({ error: "title_and_message_required" });
    }
    const capsule = await capsules.createCapsule(
      {
        title: body.title,
        message: body.message,
        ...(body.emoji ? { emoji: body.emoji } : {}),
        ...(body.unlockDate ? { unlockDate: body.unlockDate } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
      },
      user.id,
    );
    return reply.code(201).send({ data: capsule });
  });

  app.put<{ Params: { id: string } }>("/capsules/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as Record<string, unknown>;
    const capsule = await capsules.updateCapsule(user.id, request.params.id, body);
    if (!capsule) return reply.code(404).send({ error: "not_found" });
    return { data: capsule };
  });

  app.delete<{ Params: { id: string } }>("/capsules/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await capsules.deleteCapsule(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });
}
