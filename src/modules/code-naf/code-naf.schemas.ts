import { z } from "zod";

export const autocompleteCodeNafSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    q: z.string().min(1).max(255),
    limit: z.coerce.number().int().positive().max(50).optional(),
  }),
});
