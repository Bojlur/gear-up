import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { userService } from "./user.service";

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const updatedProfile = await userService.updateMyProfile(req.user!.userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: updatedProfile,
  });
});

export const userController = {
  updateMyProfile,
};
