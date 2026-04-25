import { RequestHandler } from "express";
import { t } from "../i18n";

export const notFoundMiddleware: RequestHandler = (req, res) => {
  res.status(404).json({
    message: `${t(req.lang ?? "fr", "errors.route_not_found")} : ${req.method} ${req.originalUrl}`,
  });
};
