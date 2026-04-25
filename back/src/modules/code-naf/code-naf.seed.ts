import { readFile } from "node:fs/promises";
import path from "node:path";

import type { PrismaClient } from "@prisma/client";

type NafSeedRow = {
  code: string;
  title: string;
  altCode: string;
};

export async function seedCodeNafIfEmpty(prisma: PrismaClient) {
  const codeNafCount = await prisma.codeNaf.count();

  if (codeNafCount > 0) {
    return 0;
  }

  const nafJsonPath = path.resolve(process.cwd(), "prisma", "naf.json");
  const nafJsonContent = await readFile(nafJsonPath, "utf8");
  const nafRows = JSON.parse(nafJsonContent) as NafSeedRow[];

  if (nafRows.length === 0) {
    return 0;
  }

  const result = await prisma.codeNaf.createMany({
    data: nafRows.map((row) => ({
      code: row.code,
      title: row.title,
      altCode: row.altCode,
    })),
    skipDuplicates: true,
  });

  return result.count;
}
