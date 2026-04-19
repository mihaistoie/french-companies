import { PrismaClient } from "@prisma/client";

import { ensureDefaultAdminUser } from "../src/modules/auth/auth.bootstrap";
import { seedCodeNafIfEmpty } from "../src/modules/code-naf/code-naf.seed";

const prisma = new PrismaClient();

async function main() {
  await seedCodeNafIfEmpty(prisma);
  await ensureDefaultAdminUser(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
