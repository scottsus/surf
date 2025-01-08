import { z } from "zod";

export const chooseActionResponseSchema = z.object({
  type: z.enum(["navigate", "click", "input", "refresh", "back", "done"]),
  url: z.string().url().optional(),
  ariaLabel: z.string().optional(),
  targetDescription: z.string().optional(),
  withSubmit: z.boolean().optional(),
  content: z.string().optional(),
});
