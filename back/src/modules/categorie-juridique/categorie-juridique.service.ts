import { z } from "zod";

import { prisma } from "../../lib/prisma";
import { autocompleteCategorieJuridiqueSchema } from "./categorie-juridique.schemas";

export type AutocompleteCategorieJuridiqueFilters = z.infer<typeof autocompleteCategorieJuridiqueSchema>["query"];

function normalizeSearch(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

export class CategorieJuridiqueService {
    async autocomplete(filters: AutocompleteCategorieJuridiqueFilters) {
        const limit = filters.limit ?? 10;
        const query = normalizeSearch(filters.q);

        const categories = await prisma.categorieJuridique.findMany({
            orderBy: {
                code: "asc",
            },
        });

        return categories
            .filter((categorie) => {
                return (
                    normalizeSearch(categorie.code).includes(query) ||
                    normalizeSearch(categorie.title).includes(query)
                );
            })
            .slice(0, limit);
    }
}
