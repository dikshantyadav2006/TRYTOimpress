import type { FastifyInstance } from "fastify";
import type { ApiRepos } from "../repos";
import { requireAuth } from "../auth";

export function registerReasonRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const reasons = repos.reasons;
  if (!reasons) return;
  const auth = repos.auth;

  app.get("/reasons", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await reasons.getReasons(user.id) };
  });

  app.post("/reasons", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as {
      emoji?: string;
      title?: string;
      detail?: string;
      order?: number;
    };
    if (!body.title || !body.detail) {
      return reply.code(400).send({ error: "title_and_detail_required" });
    }
    const reason = await reasons.createReason(
      {
        title: body.title,
        detail: body.detail,
        ...(body.emoji ? { emoji: body.emoji } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
      },
      user.id,
    );
    return reply.code(201).send({ data: reason });
  });

  app.put<{ Params: { id: string } }>("/reasons/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as Record<string, unknown>;
    const reason = await reasons.updateReason(user.id, request.params.id, body);
    if (!reason) return reply.code(404).send({ error: "not_found" });
    return { data: reason };
  });

  app.delete<{ Params: { id: string } }>("/reasons/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await reasons.deleteReason(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });
}
