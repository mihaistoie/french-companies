import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./lib/prisma";
import { ensureDefaultAdminUser } from "./modules/auth/auth.bootstrap";
import { seedCategorieJuridiqueIfEmpty } from "./modules/categorie-juridique/categorie-juridique.seed";
import { seedCodeNafIfEmpty } from "./modules/code-naf/code-naf.seed";

async function startServer() {
  try {
    const insertedCodeNafCount = await seedCodeNafIfEmpty(prisma);
    const insertedCategorieJuridiqueCount = await seedCategorieJuridiqueIfEmpty(prisma);
    const adminCreated = await ensureDefaultAdminUser(prisma);

    if (insertedCodeNafCount > 0) {
      logger.info(`Initialized CodeNaf table with ${insertedCodeNafCount} rows`);
    }

    if (insertedCategorieJuridiqueCount > 0) {
      logger.info(
        `Initialized CategorieJuridique table with ${insertedCategorieJuridiqueCount} rows`,
      );
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
