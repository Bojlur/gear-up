import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
import config from "../config";
import { AppError } from "../errors/AppError";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong";
  let errorDetails: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.errorDetails;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      message = "Requested record not found";
    } else if (err.code === "P2002") {
      statusCode = httpStatus.CONFLICT;
      const target = (err.meta?.target as string[] | undefined)?.join(", ");
      message = `A record with this ${target || "value"} already exists`;
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Related record does not exist";
    } else {
      statusCode = httpStatus.BAD_REQUEST;
      message = err.message;
    }
    errorDetails = { code: err.code };
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Invalid or expired token";
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (config.node_env === "development" && err instanceof Error) {
    console.error(err);
  }

  // Only surface the stack trace for truly unexpected (non-AppError, non-Prisma) failures.
  if (
    errorDetails === undefined &&
    statusCode === httpStatus.INTERNAL_SERVER_ERROR &&
    config.node_env === "development" &&
    err instanceof Error
  ) {
    errorDetails = { stack: err.stack };
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};
