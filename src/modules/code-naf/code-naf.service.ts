import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "../../lib/prisma";
import {
  autocompleteCodeNafSchema,
  listCodeNafSchema,
} from "./code-naf.schemas";

export type ListCodeNafFilters = z.infer<typeof listCodeNafSchema>["query"];
export type AutocompleteCodeNafFilters = z.infer<typeof autocompleteCodeNafSchema>["query"];

const insensitive = Prisma.QueryMode.insensitive;

export class CodeNafService {
  async list(filters: ListCodeNafFilters) {
    const limit = filters.limit ?? 50;

    const where = {
      AND: [
        filters.search
          ? {
              OR: [
                { code: { contains: filters.search, mode: insensitive } },
                { altCode: { contains: filters.search, mode: insensitive } },
                { title: { contains: filters.search, mode: insensitive } },
              ],
            }
          : {},
        filters.code ? { code: filters.code } : {},
        filters.altCode ? { altCode: filters.altCode } : {},
      ],
    } satisfies Prisma.CodeNafWhereInput;

    const items = await prisma.codeNaf.findMany({
      where,
      take: limit,
      orderBy: {
        code: "asc",
      },
    });

    return {
      items,
      meta: {
        total: items.length,
        limit,
      },
    };
  }

  async autocomplete(filters: AutocompleteCodeNafFilters) {
    const limit = filters.limit ?? 10;

    return prisma.codeNaf.findMany({
      where: {
        OR: [
          { code: { contains: filters.q, mode: insensitive } },
          { altCode: { contains: filters.q, mode: insensitive } },
          { title: { contains: filters.q, mode: insensitive } },
        ],
      },
      take: limit,
      orderBy: {
        code: "asc",
      },
    });
  }
}
