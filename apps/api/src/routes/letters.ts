import type { FastifyInstance } from "fastify";
import type { ApiRepos } from "../repos";
import { requireAuth } from "../auth";

export function registerLetterRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const letters = repos.letters;
  if (!letters) return;
  const auth = repos.auth;

  app.get("/letters", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await letters.getLetters(user.id) };
  });

  app.post("/letters", async (request, reply) => {
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
    const letter = await letters.createLetter(
      {
        title: body.title,
        message: body.message,
        ...(body.emoji ? { emoji: body.emoji } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
      },
      user.id,
    );
    return reply.code(201).send({ data: letter });
  });

  app.put<{ Params: { id: string } }>("/letters/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as Record<string, unknown>;
    const letter = await letters.updateLetter(user.id, request.params.id, body);
    if (!letter) return reply.code(404).send({ error: "not_found" });
    return { data: letter };
  });

  app.delete<{ Params: { id: string } }>("/letters/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await letters.deleteLetter(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });
}
