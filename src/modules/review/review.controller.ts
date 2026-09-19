import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const review = await reviewService.createReview(req.user!.userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review submitted successfully",
    data: review,
  });
});

const getReviewsForGear = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.getReviewsForGear(req.params.gearItemId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews fetched successfully",
    data: result,
  });
});

export const reviewController = {
  createReview,
  getReviewsForGear,
};
