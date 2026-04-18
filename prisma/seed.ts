import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

import { seedCodeNafIfEmpty } from "../src/modules/code-naf/code-naf.seed";

const prisma = new PrismaClient();

async function main() {
  await seedCodeNafIfEmpty(prisma);

  const passwordHash = await bcrypt.hash("Admin123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN",
    },
  });
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
