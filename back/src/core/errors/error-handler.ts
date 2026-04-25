import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "./app-error";
import { t, translateZodIssue } from "../i18n";
import { messages } from "../i18n/messages";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const lang = _req.lang ?? "fr";

  if (error instanceof ZodError) {
    res.status(400).json({
      message: t(lang, "errors.validation_failed"),
      errors: error.issues.map((issue) => ({
        path: issue.path,
        message: translateZodIssue(lang, issue),
      })),
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: t(lang, error.messageKey as keyof typeof messages.fr),
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    message: t(lang, "errors.internal_server_error"),
  });
};
