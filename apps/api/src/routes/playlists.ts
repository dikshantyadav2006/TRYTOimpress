import type { FastifyInstance } from "fastify";
import { slugify } from "@repo/shared";
import type { ApiRepos } from "../repos";
import { requireAuth } from "../auth";
import type { PlaylistInput } from "@repo/shared/db";

export function registerPlaylistRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const playlists = repos.playlists;
  if (!playlists) return;
  const auth = repos.auth;

  app.get("/playlists", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await playlists.list(user.id) };
  });

  app.post("/playlists", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as Partial<PlaylistInput> & { name?: string; slug?: string };
    if (!body.name?.trim()) {
      return reply.code(400).send({ error: "name_required" });
    }
    const slug = (body.slug?.trim() || slugify(body.name)).toLowerCase();
    if (!slug) return reply.code(400).send({ error: "invalid_slug" });
    if (await playlists.slugExists(user.id, slug)) {
      return reply.code(409).send({ error: "slug_taken" });
    }
    const playlist = await playlists.create(
      {
        name: body.name.trim(),
        slug,
        ...(body.description ? { description: String(body.description).trim() } : {}),
        ...(body.coverImage ? { coverImage: String(body.coverImage) } : {}),
        backgrounds: Array.isArray(body.backgrounds) ? body.backgrounds.map(String) : [],
        theme: {
          overlayColor: String(body.theme?.overlayColor ?? "#000000"),
          textColor: String(body.theme?.textColor ?? "#ffffff"),
          accentColor: String(body.theme?.accentColor ?? "#d4a373"),
        },
        quotes: Array.isArray(body.quotes) ? body.quotes.map(String).filter(Boolean) : [],
        mood: body.mood ?? "love",
        ...(Array.isArray(body.recommendedSlugs)
          ? { recommendedSlugs: body.recommendedSlugs.map(String).filter(Boolean) }
          : {}),
        songs: Array.isArray(body.songs) ? body.songs : [],
        ...(typeof body.order === "number" ? { order: body.order } : {}),
        ...(typeof body.published === "boolean" ? { published: body.published } : {}),
      },
      user.id,
    );
    return reply.code(201).send({ data: playlist });
  });

  app.put<{ Params: { id: string } }>("/playlists/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as Partial<PlaylistInput> & { name?: string; slug?: string };
    if (body.slug && (await playlists.slugExists(user.id, body.slug, request.params.id))) {
      return reply.code(409).send({ error: "slug_taken" });
    }
    const input: Partial<PlaylistInput> = {};
    if (body.name !== undefined) input.name = String(body.name).trim();
    if (body.slug !== undefined) input.slug = String(body.slug).trim().toLowerCase();
    if (body.description !== undefined) input.description = String(body.description).trim();
    if (body.coverImage !== undefined) input.coverImage = String(body.coverImage);
    if (body.backgrounds !== undefined) input.backgrounds = body.backgrounds.map(String);
    if (body.theme !== undefined)
      input.theme = {
        overlayColor: String(body.theme.overlayColor ?? "#000000"),
        textColor: String(body.theme.textColor ?? "#ffffff"),
        accentColor: String(body.theme.accentColor ?? "#d4a373"),
      };
    if (body.quotes !== undefined) input.quotes = body.quotes.map(String).filter(Boolean);
    if (body.mood !== undefined) input.mood = body.mood;
    if (body.recommendedSlugs !== undefined)
      input.recommendedSlugs = body.recommendedSlugs.map(String).filter(Boolean);
    if (body.songs !== undefined) input.songs = body.songs;
    if (body.order !== undefined) input.order = body.order;
    if (body.published !== undefined) input.published = body.published;
    const playlist = await playlists.update(user.id, request.params.id, input);
    if (!playlist) return reply.code(404).send({ error: "not_found" });
    return { data: playlist };
  });

  app.delete<{ Params: { id: string } }>("/playlists/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await playlists.delete(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });

  app.delete("/playlists", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as { ids?: string[] };
    const ids = Array.isArray(body.ids) ? body.ids : [];
    const deleted = await playlists.deleteMany(user.id, ids);
    return { data: { deleted } };
  });
}