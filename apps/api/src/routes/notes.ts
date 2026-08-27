import type { FastifyInstance } from "fastify";
import type { ApiRepos } from "../repos";
import { requireAuth } from "../auth";

export function registerLoveNoteRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const notes = repos.notes;
  if (!notes) return;
  const auth = repos.auth;

  app.get("/notes", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await notes.getLoveNotes(user.id) };
  });

  app.post("/notes", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as { emoji?: string; text?: string; order?: number };
    if (!body.text) {
      return reply.code(400).send({ error: "text_required" });
    }
    const note = await notes.createLoveNote(
      {
        text: body.text,
        ...(body.emoji ? { emoji: body.emoji } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
      },
      user.id,
    );
    return reply.code(201).send({ data: note });
  });

  app.put<{ Params: { id: string } }>("/notes/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as Record<string, unknown>;
    const note = await notes.updateLoveNote(user.id, request.params.id, body);
    if (!note) return reply.code(404).send({ error: "not_found" });
    return { data: note };
  });

  app.delete<{ Params: { id: string } }>("/notes/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await notes.deleteLoveNote(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });
}
