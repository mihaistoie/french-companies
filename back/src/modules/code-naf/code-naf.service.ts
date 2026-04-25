import { z } from "zod";

import { prisma } from "../../lib/prisma";
import { autocompleteCodeNafSchema } from "./code-naf.schemas";

export type AutocompleteCodeNafFilters = z.infer<typeof autocompleteCodeNafSchema>["query"];

export class CodeNafService {
  async autocomplete(filters: AutocompleteCodeNafFilters) {
    const limit = filters.limit ?? 10;

    return prisma.codeNaf.findMany({
      where: {
        OR: [
          { code: { contains: filters.q, mode: "insensitive" } },
          { title: { contains: filters.q, mode: "insensitive" } },
          { altCode: { contains: filters.q, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: {
        code: "asc",
      },
    });
  }
}
