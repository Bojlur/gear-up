import httpStatus from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { Role, RentalStatus, UserStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import {
  IAdminGearFilters,
  IAdminRentalFilters,
  IUpdateUserStatus,
  IUserFilters,
} from "./admin.interface";

const paginate = (page?: string, limit?: string) => {
  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);
  return { pageNumber, limitNumber, skip: (pageNumber - 1) * limitNumber };
};

const getAllUsers = async (filters: IUserFilters) => {
  const { role, status, search } = filters;
  const { pageNumber, limitNumber, skip } = paginate(filters.page, filters.limit);

  const where: Prisma.UserWhereInput = {};

  if (role) where.role = role as Role;
  if (status) where.status = status as UserStatus;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limitNumber,
      omit: { password: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: { page: pageNumber, limit: limitNumber, total, totalPage: Math.ceil(total / limitNumber) },
  };
};

const updateUserStatus = async (id: string, adminId: string, payload: IUpdateUserStatus) => {
  if (id === adminId && payload.status === "SUSPENDED") {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot suspend your own account");
  }

  await prisma.user.findUniqueOrThrow({ where: { id } });

  return prisma.user.update({
    where: { id },
    data: { status: payload.status },
    omit: { password: true },
  });
};

const getAllGearItems = async (filters: IAdminGearFilters) => {
  const { category, providerId, search } = filters;
  const { pageNumber, limitNumber, skip } = paginate(filters.page, filters.limit);

  const where: Prisma.GearItemWhereInput = {};

  if (category) where.categoryId = category;
  if (providerId) where.providerId = providerId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  const [gearItems, total] = await Promise.all([
    prisma.gearItem.findMany({
      where,
      skip,
      take: limitNumber,
      include: { category: true, provider: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.gearItem.count({ where }),
  ]);

  return {
    data: gearItems,
    meta: { page: pageNumber, limit: limitNumber, total, totalPage: Math.ceil(total / limitNumber) },
  };
};

const getAllRentalOrders = async (filters: IAdminRentalFilters) => {
  const { status, customerId } = filters;
  const { pageNumber, limitNumber, skip } = paginate(filters.page, filters.limit);

  const where: Prisma.RentalOrderWhereInput = {};

  if (status) where.status = status as RentalStatus;
  if (customerId) where.customerId = customerId;

  const [orders, total] = await Promise.all([
    prisma.rentalOrder.findMany({
      where,
      skip,
      take: limitNumber,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: { include: { gearItem: { select: { id: true, name: true, providerId: true } } } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rentalOrder.count({ where }),
  ]);

  return {
    data: orders,
    meta: { page: pageNumber, limit: limitNumber, total, totalPage: Math.ceil(total / limitNumber) },
  };
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllGearItems,
  getAllRentalOrders,
};
