import { z } from "zod";

export const completeSentenceResponseSchema = z.object({
  ok: z.boolean(),
  completion: z.string(),
});
