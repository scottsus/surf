import { z } from "zod";

export const chooseActionAndQuerySelectorResponseSchema = z.object({
  type: z.enum(["navigate", "click", "input", "refresh", "back", "done"]),
  url: z.string().url().optional(),
  idx: z.number().optional(),
  content: z.string().optional(),
  withSubmit: z.boolean().optional(),
});
