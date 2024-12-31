import { z } from "zod";

export const estimateElementLocationResponseSchema = z.object({
  ok: z.boolean(),
  xEstimate: z.number(),
  yEstimate: z.number(),
});
