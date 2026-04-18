import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./lib/prisma";
import { seedCodeNafIfEmpty } from "./modules/code-naf/code-naf.seed";

async function startServer() {
  try {
    const insertedCount = await seedCodeNafIfEmpty(prisma);

    if (insertedCount > 0) {
      logger.info(`Initialized CodeNaf table with ${insertedCount} rows`);
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
