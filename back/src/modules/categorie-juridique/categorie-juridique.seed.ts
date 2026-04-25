import { readFile } from "node:fs/promises";
import path from "node:path";

import type { prisma as appPrisma } from "../../lib/prisma";

type AppPrismaClient = typeof appPrisma;

type CategorieJuridiqueSeedRow = {
  code: string;
  title: string;
};

async function seedCategorieJuridiqueIfEmpty(prisma: AppPrismaClient) {
  const categorieJuridiqueCount = await prisma.categorieJuridique.count();

  if (categorieJuridiqueCount > 0) {
    return 0;
  }

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

export { seedCategorieJuridiqueIfEmpty };
