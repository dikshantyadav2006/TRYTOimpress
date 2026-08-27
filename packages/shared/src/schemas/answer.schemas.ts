import { z } from "zod";

export const submitAnswerSchema = z.object({
  questionId: z.string().min(1, "A question is required"),
  optionId: z.string().min(1, "Pick an option"),
});

export type SubmitAnswerFormValues = z.infer<typeof submitAnswerSchema>;
