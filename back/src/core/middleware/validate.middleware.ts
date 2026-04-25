import { NextFunction, Request, Response, RequestHandler } from "express";
import { ZodType } from "zod";

type RequestParts = {
  body?: unknown;
  params?: unknown;
  query?: unknown;
};

export function validate(schema: ZodType): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      next(result.error);
      return;
    }

    const data = result.data as RequestParts;

    req.body = data.body ?? req.body;
    req.params = data.params as Request["params"] ?? req.params;

    if (data.query) {
      Object.defineProperty(req, "query", {
        value: data.query as Request["query"],
        configurable: true,
        enumerable: true,
        writable: true,
      });
    }

    next();
  };
}
