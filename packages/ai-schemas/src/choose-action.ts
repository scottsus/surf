import { z } from "zod";

export const chooseActionResponseSchema = z.object({
  type: z.enum(["navigate", "click", "input", "refresh", "back", "done"]),
  url: z.string().url().optional(),
  buttonDescription: z.string().optional(),
  inputDescription: z.string().optional(),
  content: z.string().optional(),
});
