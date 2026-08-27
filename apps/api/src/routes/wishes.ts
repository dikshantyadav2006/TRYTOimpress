import type { FastifyInstance } from "fastify";
import type { ApiRepos } from "../repos";
import { requireAuth } from "../auth";

export function registerWishRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const wishes = repos.wishes;
  if (!wishes) return;
  const auth = repos.auth;

  app.get("/wishes", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await wishes.getWishes(user.id) };
  });

  app.post("/wishes", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as { emoji?: string; text?: string; order?: number };
    if (!body.text) {
      return reply.code(400).send({ error: "text_required" });
    }
    const wish = await wishes.createWish(
      {
        text: body.text,
        ...(body.emoji ? { emoji: body.emoji } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
      },
      user.id,
    );
    return reply.code(201).send({ data: wish });
  });

  app.put<{ Params: { id: string } }>("/wishes/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as Record<string, unknown>;
    const wish = await wishes.updateWish(user.id, request.params.id, body);
    if (!wish) return reply.code(404).send({ error: "not_found" });
    return { data: wish };
  });

  app.delete<{ Params: { id: string } }>("/wishes/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await wishes.deleteWish(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });
}
