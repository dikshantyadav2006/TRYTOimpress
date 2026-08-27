import { z } from "zod";

export const createProposalSchema = z.object({
  title: z.string().trim().min(4, "Give your proposal a short title").max(140),
  message: z.string().trim().min(10, "Write a little message").max(1000),
  subtitle: z.string().trim().max(200).optional(),
  toName: z.string().trim().min(1, "Who is it for?").max(60),
});

export type CreateProposalFormValues = z.infer<typeof createProposalSchema>;
