import type { FastifyInstance } from "fastify";
import type { ApiRepos } from "../repos";
import { requireAuth } from "../auth";

export function registerQuestionRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const questions = repos.questions;
  if (!questions) return;
  const auth = repos.auth;

  app.get("/questions", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await questions.getQuestions(user.id) };
  });

  app.post("/questions", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as {
      title?: string;
      subtitle?: string;
      emoji?: string;
      options?: unknown;
      order?: number;
      correctAnswerId?: string;
      imageId?: string;
      imageUrl?: string;
    };
    if (!body.title || !body.subtitle) {
      return reply.code(400).send({ error: "title_and_subtitle_required" });
    }
    const question = await questions.createQuestion(
      {
        title: body.title,
        subtitle: body.subtitle,
        ...(body.emoji ? { emoji: body.emoji } : {}),
        ...(Array.isArray(body.options) ? { options: body.options } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
        ...(body.correctAnswerId ? { correctAnswerId: body.correctAnswerId } : {}),
        ...(body.imageId ? { imageId: body.imageId } : {}),
        ...(body.imageUrl ? { imageUrl: body.imageUrl } : {}),
      },
      user.id,
    );
    return reply.code(201).send({ data: question });
  });

  app.put<{ Params: { id: string } }>("/questions/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as Record<string, unknown>;
    const question = await questions.updateQuestion(user.id, request.params.id, body);
    if (!question) return reply.code(404).send({ error: "not_found" });
    return { data: question };
  });

  app.delete<{ Params: { id: string } }>("/questions/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const ok = await questions.deleteQuestion(user.id, request.params.id);
    if (!ok) return reply.code(404).send({ error: "not_found" });
    return { data: { deleted: true } };
  });

  app.post("/answers", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
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

  app.get("/answers", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    return { data: await questions.getAnswers(user.id) };
  });

  app.delete("/answers", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const params = request.query as { questionId?: string };
    const deleted = await questions.deleteAnswers(user.id, params.questionId);
    return { data: { deleted } };
  });
}
