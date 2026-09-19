import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { pick } from "../../utils/pick";
import { sendResponse } from "../../utils/sendResponse";
import { IGearFilters } from "./gear.interface";
import { gearService } from "./gear.service";

const gearFilterKeys: (keyof IGearFilters)[] = [
  "category",
  "brand",
  "minPrice",
  "maxPrice",
  "search",
  "inStock",
  "page",
  "limit",
  "sortBy",
  "sortOrder",
];

const getAllGearItems = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query as IGearFilters, gearFilterKeys);

  const { data, meta } = await gearService.getAllGearItems(filters);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear items fetched successfully",
    data,
    meta,
  });
});

const getGearItemById = catchAsync(async (req: Request, res: Response) => {
  const gearItem = await gearService.getGearItemById(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item fetched successfully",
    data: gearItem,
  });
});

const createGearItem = catchAsync(async (req: Request, res: Response) => {
  const gearItem = await gearService.createGearItem(req.user!.userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Gear item added to inventory successfully",
    data: gearItem,
  });
});

const updateGearItem = catchAsync(async (req: Request, res: Response) => {
  const gearItem = await gearService.updateGearItem(req.params.id as string, req.user!.userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item updated successfully",
    data: gearItem,
  });
});

const deleteGearItem = catchAsync(async (req: Request, res: Response) => {
  await gearService.deleteGearItem(req.params.id as string, req.user!.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item removed from inventory successfully",
    data: null,
  });
});

const getProviderGearItems = catchAsync(async (req: Request, res: Response) => {
  const gearItems = await gearService.getProviderGearItems(req.user!.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your gear inventory fetched successfully",
    data: gearItems,
  });
});

export const gearController = {
  getAllGearItems,
  getGearItemById,
  createGearItem,
  updateGearItem,
  deleteGearItem,
  getProviderGearItems,
};
