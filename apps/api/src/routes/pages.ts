import type { FastifyInstance } from "fastify";
import type { ApiRepos } from "../repos";
import { requireAuth, requireEditRole } from "../auth";

export function registerPageRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const pages = repos.pages;
  if (!pages) return;
  const auth = repos.auth;

  app.get("/pages", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await pages.getPages(user.id) };
  });

  app.post("/pages", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;

    const body = (request.body ?? {}) as {
      slug?: string;
      title?: string;
      subtitle?: string;
      heroImageUrl?: string;
      blocks?: unknown;
      cta?: unknown;
      order?: number;
      published?: boolean;
    };
    if (!body.slug || !body.title) {
      return reply.code(400).send({ error: "slug_and_title_required" });
    }
    const page = await pages.createPage(
      {
        slug: body.slug,
        title: body.title,
        ...(body.subtitle ? { subtitle: body.subtitle } : {}),
        ...(body.heroImageUrl ? { heroImageUrl: body.heroImageUrl } : {}),
        ...(Array.isArray(body.blocks) ? { blocks: body.blocks } : {}),
        ...(body.cta ? { cta: body.cta as never } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
        ...(typeof body.published === "boolean" ? { published: body.published } : {}),
      },
      user.id,
    );
    return reply.code(201).send({ data: page });
  });

  app.put<{ Params: { id: string } }>("/pages/:id", async (request, reply) => {
    const access = await requireEditRole(auth, repos.share, request, reply);
    if (!access) return;
    const body = (request.body ?? {}) as Record<string, unknown>;
    const page = await pages.updatePage(access.ownerId, request.params.id, body as never);
    if (!page) return reply.code(404).send({ error: "not_found" });
    return { data: page };
  });

  app.delete<{ Params: { id: string } }>("/pages/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await pages.deletePage(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });
}
