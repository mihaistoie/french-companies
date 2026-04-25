import { env } from "../../config/env";
import type { prisma as appPrisma } from "../../lib/prisma";
import { hashPassword } from "../../lib/password";

type AppPrismaClient = typeof appPrisma;

export async function ensureDefaultAdminUser(prisma: AppPrismaClient) {
  const existingAdminUser = await prisma.user.findUnique({
    where: { email: env.DEFAULT_ADMIN_EMAIL },
    select: { id: true },
  });

  if (existingAdminUser) {
    return false;
  }

  const passwordHash = await hashPassword(env.DEFAULT_ADMIN_PASSWORD);

  await prisma.user.create({
    data: {
      email: env.DEFAULT_ADMIN_EMAIL,
      passwordHash,
      role: "ADMIN",
    },
  });

  return true;
}
