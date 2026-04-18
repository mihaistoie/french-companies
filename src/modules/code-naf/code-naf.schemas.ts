import { z } from "zod";

const codeNafSchema = z
  .string()
  .regex(/^\d{2}\.\d{2}[A-Z]$/, "codeNaf must match the format 00.00A");

const altCodeSchema = z
  .string()
  .regex(/^\d{4}[A-Z]$/, "altCode must match the format 0000A");

export const listCodeNafSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    search: z.string().max(255).optional(),
    code: codeNafSchema.optional(),
    altCode: altCodeSchema.optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export const autocompleteCodeNafSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    q: z.string().min(1).max(255),
    limit: z.coerce.number().int().positive().max(50).optional(),
  }),
});
