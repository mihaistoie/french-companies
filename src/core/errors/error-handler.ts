import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "./app-error";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Echec de validation",
      errors: error.flatten(),
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    message: "Erreur interne du serveur",
  });
};
