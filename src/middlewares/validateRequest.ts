import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError, ZodTypeAny } from "zod";
import { AppError } from "../errors/AppError";

export const validateRequest = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const zodError = result.error as ZodError;
      const errorDetails = zodError.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return next(new AppError(httpStatus.BAD_REQUEST, "Validation failed", errorDetails));
    }

    const data = result.data as { body?: unknown };
    if (data.body) req.body = data.body;
    next();
  };
};
