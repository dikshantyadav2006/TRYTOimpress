import type { FastifyInstance } from "fastify";
import { deleteSiteData } from "@repo/shared/db";
import { validateSlug } from "@repo/shared";

import type { ApiRepos } from "../repos";
import { requireAuth } from "../auth";

export function registerUserRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const auth = repos.auth;
  if (!auth) return;

  app.get("/users", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user || user.role !== "admin") {
      return reply.code(403).send({ error: "forbidden" });
    }
    return { data: await auth.listUsers() };
  });

  app.put<{ Params: { id: string } }>("/users/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user || user.role !== "admin") {
      return reply.code(403).send({ error: "forbidden" });
    }
    const body = (request.body ?? {}) as {
      name?: string;
      email?: string;
      role?: "admin" | "editor";
      slug?: string;
    };
    const input: { name?: string; email?: string; role?: "admin" | "editor"; slug?: string } = {};
    if (body.name && body.name.trim()) input.name = body.name.trim();
    if (body.email && body.email.trim()) input.email = body.email.trim().toLowerCase();
    if (body.role === "admin" || body.role === "editor") input.role = body.role;
    if (typeof body.slug === "string" && body.slug.trim()) {
      const slug = body.slug.trim().toLowerCase();
      if (!validateSlug(slug)) {
        return reply.code(400).send({ error: "invalid_slug" });
      }
      if (await auth.isSlugTaken(slug, request.params.id)) {
        return reply.code(409).send({ error: "slug_taken" });
      }
      input.slug = slug;
    }
    const updated = await auth.updateUser(request.params.id, input);
    if (!updated) return reply.code(404).send({ error: "not_found" });
    return { data: updated };
  });

  app.delete<{ Params: { id: string } }>("/users/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user || user.role !== "admin") {
      return reply.code(403).send({ error: "forbidden" });
    }
    if (user.id === request.params.id) {
      return reply.code(400).send({ error: "cannot_delete_self" });
    }
    await deleteSiteData(request.params.id);
    return { data: { deleted: true } };
  });
}
