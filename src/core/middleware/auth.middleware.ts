import { NextFunction, Request, Response, RequestHandler } from "express";

import { AppError } from "../errors/app-error";
import { verifyAccessToken } from "../../lib/jwt";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next(new AppError("Non authentifie", 401));
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    next(new AppError("Jeton invalide ou expire", 401));
  }
}

export function authorize(...roles: string[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError("Non authentifie", 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("Acces interdit", 403));
      return;
    }

    next();
  };
}
