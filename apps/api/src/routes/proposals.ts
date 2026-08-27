import type { FastifyInstance } from "fastify";
import { createProposalService, type CreateProposalInput } from "@repo/shared";
import type { ApiRepos } from "../repos";
import { requireAuth } from "../auth";

export function registerProposalRoutes(app: FastifyInstance, repos: ApiRepos): void {
  const service = createProposalService(repos.proposals);
  const auth = repos.auth;

  app.get<{ Params: { id: string } }>("/proposals/:id", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const proposal = await service.getProposal(user.id, request.params.id);
    if (!proposal) {
      return reply.code(404).send({ error: "proposal_not_found" });
    }
    return { data: proposal };
  });

  app.post<{ Body: Partial<CreateProposalInput> }>("/proposals", async (request, reply) => {
    const user = await requireAuth(auth, request, reply);
    if (!user) return;
    const body = request.body ?? {};

    if (!body.title || !body.message) {
      return reply.code(400).send({ error: "title_and_message_required" });
    }

    const proposal = await service.createProposal(user.id, {
      title: body.title,
      message: body.message,
      ...(body.subtitle ? { subtitle: body.subtitle } : {}),
      ...(body.recipientName ? { recipientName: body.recipientName } : {}),
      locale: body.locale ?? "en",
    });

    return reply.code(201).send({ data: proposal });
  });
}
