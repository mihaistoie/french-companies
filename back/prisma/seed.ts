import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { env } from "../src/config/env";
import { ensureDefaultAdminUser } from "../src/modules/auth/auth.bootstrap";
import { seedCategorieJuridique } from "../src/modules/categorie-juridique/categorie-juridique.seed";
import { seedCodeNafIfEmpty } from "../src/modules/code-naf/code-naf.seed";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await seedCodeNafIfEmpty(prisma);
  await seedCategorieJuridique(prisma);
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
