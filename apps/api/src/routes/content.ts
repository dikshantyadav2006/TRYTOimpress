import type { FastifyInstance } from "fastify";
import type { ApiRepos } from "../repos";
import { requireAuth, requireEditRole } from "../auth";

export function registerContentRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const content = repos.content;
  if (!content) return;
  const auth = repos.auth;

  app.get("/memories", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await content.getMemories(user.id) };
  });

  app.get("/gallery", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const query = request.query as { page?: string; pageSize?: string };
    if (query.page !== undefined) {
      const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
      const pageSize = Math.min(60, Math.max(1, Number.parseInt(query.pageSize ?? "24", 10) || 24));
      const feed = await content.getGalleryFeed(user.id, page, pageSize);
      return {
        data: {
          items: feed.items,
          total: feed.total,
          hasMore: feed.hasMore,
          nextPage: feed.hasMore ? page + 1 : null,
        },
      };
    }
    return { data: await content.getGalleryImages(user.id) };
  });

  app.post("/memories", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as {
      title?: string;
      date?: string;
      caption?: string;
      imageId?: string;
      imageUrl?: string;
      order?: number;
    };
    if (!body.title || !body.date || !body.caption) {
      return reply.code(400).send({ error: "title_date_caption_required" });
    }
    const memory = await content.createMemory(
      {
        title: body.title,
        date: body.date,
        caption: body.caption,
        ...(body.imageId ? { imageId: body.imageId } : {}),
        ...(body.imageUrl ? { imageUrl: body.imageUrl } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
      },
      user.id,
    );
    return reply.code(201).send({ data: memory });
  });

  app.put<{ Params: { id: string } }>("/memories/:id", async (request, reply) => {
    const access = await requireEditRole(auth, repos.share, request, reply);
    if (!access) return;
    const ownerId = access.ownerId;
    const body = (request.body ?? {}) as Record<string, unknown>;
    const memory = await content.updateMemory(ownerId, request.params.id, body);
    if (!memory) return reply.code(404).send({ error: "not_found" });
    return { data: memory };
  });

  app.delete<{ Params: { id: string } }>("/memories/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await content.deleteMemory(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });

  app.post("/gallery", async (request, reply) => {
    const access = await requireEditRole(auth, repos.share, request, reply);
    if (!access) return;
    const body = (request.body ?? {}) as {
      caption?: string;
      category?: "moment" | "story" | "favourite";
      featured?: boolean;
      order?: number;
      imageUrl?: string;
    };
    const caption = (body.caption ?? "").trim() || "Untitled";
    const image = await content.createGalleryImage(
      {
        caption,
        ...(body.category ? { category: body.category } : {}),
        ...(typeof body.featured === "boolean" ? { featured: body.featured } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
        ...(body.imageUrl ? { imageUrl: body.imageUrl } : {}),
      },
      access.ownerId,
    );
    return reply.code(201).send({ data: image });
  });

  app.put<{ Params: { id: string } }>("/gallery/:id", async (request, reply) => {
    const access = await requireEditRole(auth, repos.share, request, reply);
    if (!access) return;
    const body = (request.body ?? {}) as Record<string, unknown>;
    const image = await content.updateGalleryImage(access.ownerId, request.params.id, body);
    if (!image) return reply.code(404).send({ error: "not_found" });
    return { data: image };
  });

  app.delete<{ Params: { id: string } }>("/gallery/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await content.deleteGalleryImage(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });
}
