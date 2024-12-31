import { z } from "zod";

export const chooseQuerySelectorResponseSchema = z.object({
  index: z.number(),
});
