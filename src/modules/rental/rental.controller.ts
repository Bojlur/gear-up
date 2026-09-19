import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";

const createRentalOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await rentalService.createRentalOrder(req.user!.userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental order placed successfully",
    data: order,
  });
});

const getMyRentalOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await rentalService.getMyRentalOrders(req.user!.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental orders fetched successfully",
    data: orders,
  });
});

const getRentalOrderById = catchAsync(async (req: Request, res: Response) => {
  const order = await rentalService.getRentalOrderById(
    req.params.id as string,
    req.user!.userId,
    req.user!.role
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental order fetched successfully",
    data: order,
  });
});

const cancelRentalOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await rentalService.cancelRentalOrder(req.params.id as string, req.user!.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental order cancelled successfully",
    data: order,
  });
});

const getProviderOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await rentalService.getProviderOrders(req.user!.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Incoming rental orders fetched successfully",
    data: orders,
  });
});

const updateProviderOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const order = await rentalService.updateProviderOrderStatus(
    req.params.id as string,
    req.user!.userId,
    req.body.status
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental order status updated successfully",
    data: order,
  });
});

export const rentalController = {
  createRentalOrder,
  getMyRentalOrders,
  getRentalOrderById,
  cancelRentalOrder,
  getProviderOrders,
  updateProviderOrderStatus,
};
