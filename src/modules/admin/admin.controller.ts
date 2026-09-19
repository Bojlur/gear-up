import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { pick } from "../../utils/pick";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";
import { IAdminGearFilters, IAdminRentalFilters, IUserFilters } from "./admin.interface";

const userFilterKeys: (keyof IUserFilters)[] = ["role", "status", "search", "page", "limit"];
const gearFilterKeys: (keyof IAdminGearFilters)[] = ["category", "providerId", "search", "page", "limit"];
const rentalFilterKeys: (keyof IAdminRentalFilters)[] = ["status", "customerId", "page", "limit"];

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query as IUserFilters, userFilterKeys);
  const { data, meta } = await adminService.getAllUsers(filters);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users fetched successfully",
    data,
    meta,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const user = await adminService.updateUserStatus(req.params.id as string, req.user!.userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User status updated successfully",
    data: user,
  });
});

const getAllGearItems = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query as IAdminGearFilters, gearFilterKeys);
  const { data, meta } = await adminService.getAllGearItems(filters);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear items fetched successfully",
    data,
    meta,
  });
});

const getAllRentalOrders = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query as IAdminRentalFilters, rentalFilterKeys);
  const { data, meta } = await adminService.getAllRentalOrders(filters);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental orders fetched successfully",
    data,
    meta,
  });
});

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllGearItems,
  getAllRentalOrders,
};
