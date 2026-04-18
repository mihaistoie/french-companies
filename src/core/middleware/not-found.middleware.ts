import { RequestHandler } from "express";

export const notFoundMiddleware: RequestHandler = (req, res) => {
  res.status(404).json({
    message: `Route introuvable : ${req.method} ${req.originalUrl}`,
  });
};
