import { z } from "zod";

export const evaluateActionsResponseSchema = z.object({
  evaluation: z.array(z.boolean()),
});
