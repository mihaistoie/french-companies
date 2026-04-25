import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./lib/prisma";
import { ensureDefaultAdminUser } from "./modules/auth/auth.bootstrap";
import { seedCodeNafIfEmpty } from "./modules/code-naf/code-naf.seed";

async function startServer() {
  try {
    const insertedCount = await seedCodeNafIfEmpty(prisma);
    const adminCreated = await ensureDefaultAdminUser(prisma);

    if (insertedCount > 0) {
      logger.info(`Initialized CodeNaf table with ${insertedCount} rows`);
    }

    if (adminCreated) {
      logger.info("Utilisateur admin par defaut cree : admin@example.com");
    }

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error(error, "Failed to initialize server");
    process.exit(1);
  }
}

void startServer();
