import { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../config";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: config.node_env === "production",
  sameSite: "none" as const,
  maxAge: 1000 * 60 * 60 * 24, // 1 day
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: config.node_env === "production",
  sameSite: "none" as const,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.registerUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: user,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } = await authService.loginUser(req.body);

  res.cookie("accessToken", accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: { accessToken, refreshToken, user },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  const result = await authService.refreshToken(token);

  res.cookie("accessToken", result.accessToken, accessTokenCookieOptions);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Access token refreshed successfully",
    data: result,
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken", accessTokenCookieOptions);
  res.clearCookie("refreshToken", refreshTokenCookieOptions);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Logged out successfully",
    data: null,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Current user fetched successfully",
    data: user,
  });
});

export const authController = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getMe,
};
