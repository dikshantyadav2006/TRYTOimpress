import type { FastifyInstance } from "fastify";
import type { ApiRepos } from "../repos";
import { requireAuth } from "../auth";

export function registerDateRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const dates = repos.dates;
  if (!dates) return;
  const auth = repos.auth;

  app.get("/dates", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await dates.getDateIdeas(user.id) };
  });

  app.post("/dates", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as {
      emoji?: string;
      title?: string;
      description?: string;
      tag?: string;
      order?: number;
    };
    if (!body.title || !body.description) {
      return reply.code(400).send({ error: "title_and_description_required" });
    }
    const dateIdea = await dates.createDateIdea(
      {
        title: body.title,
        description: body.description,
        ...(body.emoji ? { emoji: body.emoji } : {}),
        ...(body.tag ? { tag: body.tag } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
      },
      user.id,
    );
    return reply.code(201).send({ data: dateIdea });
  });

  app.put<{ Params: { id: string } }>("/dates/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as Record<string, unknown>;
    const dateIdea = await dates.updateDateIdea(user.id, request.params.id, body);
    if (!dateIdea) return reply.code(404).send({ error: "not_found" });
    return { data: dateIdea };
  });

  app.delete<{ Params: { id: string } }>("/dates/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await dates.deleteDateIdea(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });
}
