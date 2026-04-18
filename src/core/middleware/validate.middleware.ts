import { NextFunction, Request, Response, RequestHandler } from "express";
import { ZodType } from "zod";

export function validate(schema: ZodType): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    next();
  };
}
