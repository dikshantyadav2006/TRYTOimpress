import type { FastifyInstance } from "fastify";
import type { ApiRepos } from "../repos";
import { requireAuth } from "../auth";

export function registerComplimentRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const compliments = repos.compliments;
  if (!compliments) return;
  const auth = repos.auth;

  app.get("/compliments", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await compliments.getCompliments(user.id) };
  });

  app.post("/compliments", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as { emoji?: string; text?: string; order?: number };
    if (!body.text) {
      return reply.code(400).send({ error: "text_required" });
    }
    const compliment = await compliments.createCompliment(
      {
        text: body.text,
        ...(body.emoji ? { emoji: body.emoji } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
      },
      user.id,
    );
    return reply.code(201).send({ data: compliment });
  });

  app.put<{ Params: { id: string } }>("/compliments/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as Record<string, unknown>;
    const compliment = await compliments.updateCompliment(user.id, request.params.id, body);
    if (!compliment) return reply.code(404).send({ error: "not_found" });
    return { data: compliment };
  });

  app.delete<{ Params: { id: string } }>("/compliments/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await compliments.deleteCompliment(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });
}
