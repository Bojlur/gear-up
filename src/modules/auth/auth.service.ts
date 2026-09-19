import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { ILoginUser, IRegisterUser } from "./auth.interface";

const generateTokens = (jwtPayload: JwtPayload) => {
  const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, {
    expiresIn: config.jwt_access_expires_in,
  } as SignOptions);

  const refreshToken = jwtUtils.createToken(jwtPayload, config.jwt_refresh_secret, {
    expiresIn: config.jwt_refresh_expires_in,
  } as SignOptions);

  return { accessToken, refreshToken };
};

const registerUser = async (payload: IRegisterUser) => {
  const { name, email, password, phone, address, role } = payload;

  const isUserExist = await prisma.user.findUnique({ where: { email } });

  if (isUserExist) {
    throw new AppError(httpStatus.CONFLICT, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: role || "CUSTOMER",
    },
    omit: { password: true },
  });

  return user;
};

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  if (user.status === "SUSPENDED") {
    throw new AppError(httpStatus.FORBIDDEN, "Your account has been suspended. Please contact support.");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const { accessToken, refreshToken } = generateTokens(jwtPayload);

  const { password: _password, ...userWithoutPassword } = user;

  return { accessToken, refreshToken, user: userWithoutPassword };
};

const refreshToken = async (token: string | undefined) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized. Please log in again.");
  }

  const verifiedToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret);

  if (!verifiedToken.success) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token. Please log in again.");
  }

  const { userId, email } = verifiedToken.data as JwtPayload;

  const user = await prisma.user.findUnique({ where: { id: userId, email } });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not found. Please log in again.");
  }

  if (user.status === "SUSPENDED") {
    throw new AppError(httpStatus.FORBIDDEN, "Your account has been suspended. Please contact support.");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, {
    expiresIn: config.jwt_access_expires_in,
  } as SignOptions);

  return { accessToken };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: { password: true },
  });

  return user;
};

export const authService = {
  registerUser,
  loginUser,
  refreshToken,
  getMe,
};
