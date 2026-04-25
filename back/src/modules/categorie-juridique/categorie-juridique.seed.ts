import { readFile } from "node:fs/promises";
import path from "node:path";

import type { PrismaClient } from "@prisma/client";

type CategorieJuridiqueSeedRow = {
  code: string;
  title: string;
};

async function seedCategorieJuridique(prisma: PrismaClient) {
  const cjJsonPath = path.resolve(process.cwd(), "prisma", "cj.json");
  const cjJsonContent = await readFile(cjJsonPath, "utf8");
  const cjRows = JSON.parse(cjJsonContent) as CategorieJuridiqueSeedRow[];

  if (cjRows.length === 0) {
    return 0;
  }

  const result = await prisma.categorieJuridique.createMany({
    data: cjRows.map((row) => ({
      code: row.code,
      title: row.title,
    })),
    skipDuplicates: true,
  });

  return result.count;
}

export { seedCategorieJuridique };
