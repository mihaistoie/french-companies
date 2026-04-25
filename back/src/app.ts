import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { httpLogger } from "./config/logger";
import { errorHandler } from "./core/errors/error-handler";
import { languageMiddleware } from "./core/i18n";
import { notFoundMiddleware } from "./core/middleware/not-found.middleware";
import { docsRouter } from "./routes/docs.routes";
import { apiRouter } from "./routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  }),
);
app.use(httpLogger);
app.use(express.json());
app.use(languageMiddleware);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(docsRouter);
app.use("/api/v1", apiRouter);
app.use(notFoundMiddleware);
app.use(errorHandler);

export { app };
