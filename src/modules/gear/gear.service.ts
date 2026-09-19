import httpStatus from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateGearItem, IGearFilters, IUpdateGearItem } from "./gear.interface";

const getAllGearItems = async (filters: IGearFilters) => {
  const { category, brand, minPrice, maxPrice, search, inStock, sortBy, sortOrder } = filters;

  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.min(Math.max(Number(filters.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const where: Prisma.GearItemWhereInput = { isAvailable: true };

  if (category) where.categoryId = category;
  if (brand) where.brand = { contains: brand, mode: "insensitive" };
  if (inStock === "true") where.availableStock = { gt: 0 };

  if (minPrice || maxPrice) {
    where.pricePerDay = {
      ...(minPrice ? { gte: Number(minPrice) } : {}),
      ...(maxPrice ? { lte: Number(maxPrice) } : {}),
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  const allowedSortFields = ["pricePerDay", "createdAt", "name"];
  const orderByField = allowedSortFields.includes(sortBy || "") ? (sortBy as string) : "createdAt";
  const orderByDirection = sortOrder === "asc" ? "asc" : "desc";

  const [gearItems, total] = await Promise.all([
    prisma.gearItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [orderByField]: orderByDirection },
      include: { category: true, provider: { select: { id: true, name: true } } },
    }),
    prisma.gearItem.count({ where }),
  ]);

  return {
    data: gearItems,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

const getGearItemById = async (id: string) => {
  const gearItem = await prisma.gearItem.findUniqueOrThrow({
    where: { id },
    include: { category: true, provider: { select: { id: true, name: true } } },
  });

  return gearItem;
};

const createGearItem = async (providerId: string, payload: ICreateGearItem) => {
  const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
  if (!category) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category not found");
  }

  return prisma.gearItem.create({
    data: {
      name: payload.name,
      description: payload.description,
      brand: payload.brand,
      images: payload.images || [],
      pricePerDay: payload.pricePerDay,
      stock: payload.stock,
      availableStock: payload.stock,
      specifications: payload.specifications as Prisma.InputJsonValue,
      categoryId: payload.categoryId,
      providerId,
      isAvailable: payload.isAvailable ?? true,
    },
  });
};

const assertGearOwnership = async (id: string, providerId: string) => {
  const gearItem = await prisma.gearItem.findUniqueOrThrow({ where: { id } });

  if (gearItem.providerId !== providerId) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not own this gear item");
  }

  return gearItem;
};

const updateGearItem = async (id: string, providerId: string, payload: IUpdateGearItem) => {
  const gearItem = await assertGearOwnership(id, providerId);

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
    if (!category) {
      throw new AppError(httpStatus.BAD_REQUEST, "Category not found");
    }
  }

  const data: Prisma.GearItemUpdateInput = {
    name: payload.name,
    description: payload.description,
    brand: payload.brand,
    images: payload.images,
    pricePerDay: payload.pricePerDay,
    specifications: payload.specifications as Prisma.InputJsonValue,
    isAvailable: payload.isAvailable,
    ...(payload.categoryId ? { category: { connect: { id: payload.categoryId } } } : {}),
  };

  if (payload.stock !== undefined) {
    const delta = payload.stock - gearItem.stock;
    data.stock = payload.stock;
    data.availableStock = Math.max(0, gearItem.availableStock + delta);
  }

  return prisma.gearItem.update({ where: { id }, data });
};

const deleteGearItem = async (id: string, providerId: string) => {
  await assertGearOwnership(id, providerId);

  const activeOrderItemCount = await prisma.rentalOrderItem.count({
    where: {
      gearItemId: id,
      rentalOrder: { status: { in: ["PLACED", "CONFIRMED", "PAID", "PICKED_UP"] } },
    },
  });

  if (activeOrderItemCount > 0) {
    throw new AppError(httpStatus.CONFLICT, "Cannot delete gear with active rental orders");
  }

  return prisma.gearItem.delete({ where: { id } });
};

const getProviderGearItems = async (providerId: string) => {
  return prisma.gearItem.findMany({
    where: { providerId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
};

export const gearService = {
  getAllGearItems,
  getGearItemById,
  createGearItem,
  updateGearItem,
  deleteGearItem,
  getProviderGearItems,
};
