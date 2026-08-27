import type { FastifyInstance } from "fastify";
import type { ApiRepos } from "../repos";
import { requireAuth } from "../auth";

export function registerSurpriseRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const surprises = repos.surprises;
  if (!surprises) return;
  const auth = repos.auth;

  app.get("/surprises", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await surprises.getSurprises(user.id) };
  });

  app.post("/surprises", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as {
      emoji?: string;
      title?: string;
      message?: string;
      order?: number;
    };
    if (!body.title || !body.message) {
      return reply.code(400).send({ error: "title_and_message_required" });
    }
    const surprise = await surprises.createSurprise(
      {
        title: body.title,
        message: body.message,
        ...(body.emoji ? { emoji: body.emoji } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
      },
      user.id,
    );
    return reply.code(201).send({ data: surprise });
  });

  app.put<{ Params: { id: string } }>("/surprises/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as Record<string, unknown>;
    const surprise = await surprises.updateSurprise(user.id, request.params.id, body);
    if (!surprise) return reply.code(404).send({ error: "not_found" });
    return { data: surprise };
  });

  app.delete<{ Params: { id: string } }>("/surprises/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await surprises.deleteSurprise(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });
}
