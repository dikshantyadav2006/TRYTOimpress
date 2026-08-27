import type { FastifyInstance } from "fastify";
import { adoptOrphanedData, seedSite } from "@repo/shared/db";
import { generateSiteSlug, slugifyName, validateSlug } from "@repo/shared";

import type { ApiRepos } from "../repos";
import { SESSION_COOKIE, requireAuth } from "../auth";

export function registerAuthRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const auth = repos.auth;
  if (!auth) return;

  app.post("/auth/register", async (request, reply) => {
    const body = (request.body ?? {}) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    if (!name || !email || !password || password.length < 6) {
      return reply.code(400).send({ error: "invalid_registration" });
    }

    const existing = await auth.findByEmail(email);
    if (existing) {
      return reply.code(409).send({ error: "email_taken" });
    }

    let slug = slugifyName(name) || generateSiteSlug();
    while (await auth.isSlugTaken(slug)) {
      slug = generateSiteSlug();
    }

    const userCount = await auth.countUsers();
    const isFirst = userCount === 0;
    const user = await auth.createUser({
      name,
      email,
      slug,
      password,
      role: isFirst ? "admin" : "editor",
    });

    if (isFirst) {
      await adoptOrphanedData(user.id);
    }
    await seedSite(user.id);

    const session = await auth.createSession(user.id);
    void reply.setCookie(SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    return reply.code(201).send({ data: user });
  });

  app.post("/auth/login", async (request, reply) => {
    const body = (request.body ?? {}) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return reply.code(400).send({ error: "email_and_password_required" });
    }
    const user = await auth.verifyCredentials(body.email, body.password);
    if (!user) {
      return reply.code(401).send({ error: "invalid_credentials" });
    }
    const session = await auth.createSession(user.id);
    void reply.setCookie(SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    return { data: user };
  });

  app.post("/auth/logout", async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE];
    if (token) await auth.deleteSession(token);
    void reply.clearCookie(SESSION_COOKIE, { path: "/" });
    return { data: { loggedOut: true } };
  });

  app.get("/auth/me", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: user };
  });

  app.put("/auth/me", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;

    const body = (request.body ?? {}) as {
      name?: string;
      slug?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const patch: { name?: string; slug?: string } = {};
    if (typeof body.name === "string" && body.name.trim()) {
      patch.name = body.name.trim();
    }
    if (typeof body.slug === "string") {
      const slug = body.slug.trim().toLowerCase();
      if (!validateSlug(slug)) {
        return reply.code(400).send({ error: "invalid_slug" });
      }
      if (await auth.isSlugTaken(slug, user.id)) {
        return reply.code(409).send({ error: "slug_taken" });
      }
      patch.slug = slug;
    }
    if (typeof body.newPassword === "string" && body.newPassword) {
      if (body.newPassword.length < 6) {
        return reply.code(400).send({ error: "password_too_short" });
      }
      const verified = body.currentPassword
        ? await auth.verifyCredentials(user.email, body.currentPassword)
        : null;
      if (!verified) {
        return reply.code(403).send({ error: "wrong_password" });
      }
      await auth.updatePassword(user.id, body.newPassword);
    }

    let updated = user;
    if (Object.keys(patch).length > 0) {
      const result = await auth.updateUser(user.id, patch);
      if (result) updated = result;
    }
    return { data: updated };
  });
}
