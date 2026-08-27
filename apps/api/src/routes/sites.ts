import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { AdminUser } from "@repo/shared";

import type { ApiRepos } from "../repos";

export function registerSiteRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const auth = repos.auth;
  const content = repos.content;
  const questions = repos.questions;
  const settings = repos.settings;
  const pages = repos.pages;
  const songs = repos.songs;
  const reasons = repos.reasons;
  const dates = repos.dates;
  const letters = repos.letters;
  const notes = repos.notes;
  const compliments = repos.compliments;
  const wishes = repos.wishes;
  const promises = repos.promises;
  const dreams = repos.dreams;
  const capsules = repos.capsules;
  const surprises = repos.surprises;

  async function resolveSite(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<AdminUser | null> {
    if (!auth) {
      await reply.code(503).send({ error: "db_not_configured" });
      return null;
    }
    const { slug } = request.params as { slug: string };
    const user = await auth.findBySlug(slug);
    if (!user) {
      await reply.code(404).send({ error: "site_not_found" });
      return null;
    }
    return user;
  }

  app.get<{ Params: { slug: string } }>("/sites/:slug", async (request, reply) => {
    if (!auth) return reply.code(503).send({ error: "db_not_configured" });
    const user = await auth.findBySlug(request.params.slug);
    if (!user) return reply.code(404).send({ error: "site_not_found" });
    return { data: { slug: user.slug, ownerId: user.id, name: user.name } };
  });

  app.get<{ Params: { slug: string } }>("/sites/:slug/settings", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user) return;
    const current = settings ? await settings.getSettings(user.id) : null;
    if (!current) return reply.code(404).send({ error: "settings_not_seeded" });
    return { data: current };
  });

  app.get<{ Params: { slug: string } }>("/sites/:slug/memories", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !content) return;
    return { data: await content.getMemories(user.id) };
  });

  app.get<{ Params: { slug: string } }>("/sites/:slug/gallery", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !content) return;
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

  app.get<{ Params: { slug: string } }>("/sites/:slug/pages", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !pages) return;
    return { data: await pages.getPublishedPages(user.id) };
  });

  app.get<{ Params: { slug: string; pageSlug: string } }>(
    "/sites/:slug/pages/:pageSlug",
    async (request, reply) => {
      const user = await resolveSite(request, reply);
      if (!user || !pages) return;
      const page = await pages.getPageBySlug(user.id, request.params.pageSlug);
      if (!page || !page.published) return reply.code(404).send({ error: "not_found" });
      return { data: page };
    },
  );

  app.get<{ Params: { slug: string } }>("/sites/:slug/questions", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !questions) return;
    return { data: await questions.getQuestions(user.id) };
  });

  app.get<{ Params: { slug: string } }>("/sites/:slug/songs", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !songs) return;
    return { data: await songs.getSongs(user.id) };
  });

  app.get<{ Params: { slug: string } }>("/sites/:slug/reasons", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !reasons) return;
    return { data: await reasons.getReasons(user.id) };
  });

  app.get<{ Params: { slug: string } }>("/sites/:slug/dates", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !dates) return;
    return { data: await dates.getDateIdeas(user.id) };
  });

  app.get<{ Params: { slug: string } }>("/sites/:slug/letters", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !letters) return;
    return { data: await letters.getLetters(user.id) };
  });

  app.get<{ Params: { slug: string } }>("/sites/:slug/notes", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !notes) return;
    return { data: await notes.getLoveNotes(user.id) };
  });

  app.get<{ Params: { slug: string } }>("/sites/:slug/compliments", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !compliments) return;
    return { data: await compliments.getCompliments(user.id) };
  });

  app.get<{ Params: { slug: string } }>("/sites/:slug/wishes", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !wishes) return;
    return { data: await wishes.getWishes(user.id) };
  });

  app.get<{ Params: { slug: string } }>("/sites/:slug/promises", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !promises) return;
    return { data: await promises.getLovePromises(user.id) };
  });

  app.get<{ Params: { slug: string } }>("/sites/:slug/dreams", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !dreams) return;
    return { data: await dreams.getDreams(user.id) };
  });

  app.get<{ Params: { slug: string } }>("/sites/:slug/capsules", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !capsules) return;
    return { data: await capsules.getCapsules(user.id) };
  });

  app.get<{ Params: { slug: string } }>("/sites/:slug/surprises", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !surprises) return;
    return { data: await surprises.getSurprises(user.id) };
  });

  app.post<{ Params: { slug: string } }>("/sites/:slug/answers", async (request, reply) => {
    const user = await resolveSite(request, reply);
    if (!user || !questions) return;
    const body = (request.body ?? {}) as { questionId?: string; optionId?: string };
    if (!body.questionId || !body.optionId) {
      return reply.code(400).send({ error: "question_and_option_required" });
    }
    const answer = await questions.submitAnswer(
      { questionId: body.questionId, optionId: body.optionId },
      user.id,
    );
    return reply.code(201).send({ data: answer });
  });
}
