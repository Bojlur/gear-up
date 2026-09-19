import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";
import { AppError } from "../errors/AppError";
import { prisma } from "../lib/prisma";
import config from "../config";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        name: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not logged in. Please log in to get access.");
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifiedToken.success) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token. Please log in again.");
    }

    const { userId, email, name, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.FORBIDDEN, "You don't have permission to access this resource.");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not found. Please log in again.");
    }

    if (user.status === "SUSPENDED") {
      throw new AppError(httpStatus.FORBIDDEN, "Your account has been suspended. Please contact support.");
    }

    req.user = { userId, email, name, role };

    next();
  });
};
