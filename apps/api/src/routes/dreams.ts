import type { FastifyInstance } from "fastify";
import type { ApiRepos } from "../repos";
import { requireAuth } from "../auth";

export function registerDreamRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const dreams = repos.dreams;
  if (!dreams) return;
  const auth = repos.auth;

  app.get("/dreams", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await dreams.getDreams(user.id) };
  });

  app.post("/dreams", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as {
      emoji?: string;
      title?: string;
      text?: string;
      order?: number;
    };
    if (!body.title || !body.text) {
      return reply.code(400).send({ error: "title_and_text_required" });
    }
    const dream = await dreams.createDream(
      {
        title: body.title,
        text: body.text,
        ...(body.emoji ? { emoji: body.emoji } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
      },
      user.id,
    );
    return reply.code(201).send({ data: dream });
  });

  app.put<{ Params: { id: string } }>("/dreams/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as Record<string, unknown>;
    const dream = await dreams.updateDream(user.id, request.params.id, body);
    if (!dream) return reply.code(404).send({ error: "not_found" });
    return { data: dream };
  });

  app.delete<{ Params: { id: string } }>("/dreams/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await dreams.deleteDream(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });
}
