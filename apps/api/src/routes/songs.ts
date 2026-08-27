import type { FastifyInstance } from "fastify";
import type { ApiRepos } from "../repos";
import { requireAuth } from "../auth";

export function registerSongRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const songs = repos.songs;
  if (!songs) return;
  const auth = repos.auth;

  app.get("/songs", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await songs.getSongs(user.id) };
  });

  app.post("/songs", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as {
      title?: string;
      artist?: string;
      youtubeId?: string;
      note?: string;
      order?: number;
    };
    if (!body.title || !body.artist || !body.youtubeId) {
      return reply.code(400).send({ error: "title_artist_youtube_required" });
    }
    const song = await songs.createSong(
      {
        title: body.title,
        artist: body.artist,
        youtubeId: body.youtubeId,
        ...(body.note ? { note: body.note } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
      },
      user.id,
    );
    return reply.code(201).send({ data: song });
  });

  app.put<{ Params: { id: string } }>("/songs/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as Record<string, unknown>;
    const song = await songs.updateSong(user.id, request.params.id, body);
    if (!song) return reply.code(404).send({ error: "not_found" });
    return { data: song };
  });

  app.delete<{ Params: { id: string } }>("/songs/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await songs.deleteSong(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });
}
