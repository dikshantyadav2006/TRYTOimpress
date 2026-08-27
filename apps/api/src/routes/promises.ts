import type { FastifyInstance } from "fastify";
import type { ApiRepos } from "../repos";
import { requireAuth } from "../auth";

export function registerLovePromiseRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const promises = repos.promises;
  if (!promises) return;
  const auth = repos.auth;

  app.get("/promises", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await promises.getLovePromises(user.id) };
  });

  app.post("/promises", async (request, reply) => {
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
    const promise = await promises.createLovePromise(
      {
        title: body.title,
        text: body.text,
        ...(body.emoji ? { emoji: body.emoji } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
      },
      user.id,
    );
    return reply.code(201).send({ data: promise });
  });

  app.put<{ Params: { id: string } }>("/promises/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as Record<string, unknown>;
    const promise = await promises.updateLovePromise(user.id, request.params.id, body);
    if (!promise) return reply.code(404).send({ error: "not_found" });
    return { data: promise };
  });

  app.delete<{ Params: { id: string } }>("/promises/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await promises.deleteLovePromise(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });
}
