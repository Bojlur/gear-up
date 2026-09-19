import httpStatus from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateRentalOrder, TProviderOrderStatus } from "./rental.interface";

const orderIncludes = {
  items: { include: { gearItem: true } },
  payments: true,
} satisfies Prisma.RentalOrderInclude;

const calculateRentalDays = (startDate: Date, endDate: Date) =>
  Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

const createRentalOrder = async (customerId: string, payload: ICreateRentalOrder) => {
  const { startDate, endDate, items } = payload;
  const days = calculateRentalDays(startDate, endDate);

  return prisma.$transaction(async (tx) => {
    let totalAmount = new Prisma.Decimal(0);
    const orderItemsData: Prisma.RentalOrderItemCreateWithoutRentalOrderInput[] = [];

    for (const item of items) {
      const gearItem = await tx.gearItem.findUnique({ where: { id: item.gearItemId } });

      if (!gearItem) {
        throw new AppError(httpStatus.NOT_FOUND, `Gear item ${item.gearItemId} not found`);
      }
      if (!gearItem.isAvailable) {
        throw new AppError(httpStatus.BAD_REQUEST, `${gearItem.name} is not currently available for rent`);
      }
      if (gearItem.availableStock < item.quantity) {
        throw new AppError(
          httpStatus.CONFLICT,
          `${gearItem.name} only has ${gearItem.availableStock} unit(s) available`
        );
      }

      const subtotal = gearItem.pricePerDay.mul(item.quantity).mul(days);
      totalAmount = totalAmount.add(subtotal);

      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: { availableStock: { decrement: item.quantity } },
      });

      orderItemsData.push({
        quantity: item.quantity,
        pricePerDay: gearItem.pricePerDay,
        subtotal,
        gearItem: { connect: { id: item.gearItemId } },
      });
    }

    return tx.rentalOrder.create({
      data: {
        customerId,
        startDate,
        endDate,
        totalAmount,
        items: { create: orderItemsData },
      },
      include: orderIncludes,
    });
  });
};

const getMyRentalOrders = async (customerId: string) => {
  return prisma.rentalOrder.findMany({
    where: { customerId },
    include: orderIncludes,
    orderBy: { createdAt: "desc" },
  });
};

const getRentalOrderById = async (id: string, userId: string, role: string) => {
  const order = await prisma.rentalOrder.findUniqueOrThrow({ where: { id }, include: orderIncludes });

  const isOwner = order.customerId === userId;
  const isProviderOfSomeItem = order.items.some((item) => item.gearItem.providerId === userId);

  if (!isOwner && !isProviderOfSomeItem && role !== "ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have access to this rental order");
  }

  return order;
};

const restoreStockForOrder = async (tx: Prisma.TransactionClient, orderId: string) => {
  const items = await tx.rentalOrderItem.findMany({ where: { rentalOrderId: orderId } });

  for (const item of items) {
    await tx.gearItem.update({
      where: { id: item.gearItemId },
      data: { availableStock: { increment: item.quantity } },
    });
  }
};

const cancelRentalOrder = async (id: string, customerId: string) => {
  const order = await prisma.rentalOrder.findUniqueOrThrow({ where: { id } });

  if (order.customerId !== customerId) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have access to this rental order");
  }

  if (order.status !== "PLACED") {
    throw new AppError(
      httpStatus.CONFLICT,
      `Order cannot be cancelled once it has been ${order.status.toLowerCase()}`
    );
  }

  return prisma.$transaction(async (tx) => {
    await restoreStockForOrder(tx, id);

    return tx.rentalOrder.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: orderIncludes,
    });
  });
};

const getProviderOrders = async (providerId: string) => {
  return prisma.rentalOrder.findMany({
    where: { items: { some: { gearItem: { providerId } } } },
    include: orderIncludes,
    orderBy: { createdAt: "desc" },
  });
};

const ALLOWED_PROVIDER_TRANSITIONS: Record<string, TProviderOrderStatus[]> = {
  PLACED: ["CONFIRMED"],
  PAID: ["PICKED_UP"],
  PICKED_UP: ["RETURNED"],
};

const updateProviderOrderStatus = async (id: string, providerId: string, status: TProviderOrderStatus) => {
  const order = await prisma.rentalOrder.findUniqueOrThrow({ where: { id }, include: orderIncludes });

  const ownsAnItem = order.items.some((item) => item.gearItem.providerId === providerId);
  if (!ownsAnItem) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have any gear items in this order");
  }

  const allowedNextStatuses = ALLOWED_PROVIDER_TRANSITIONS[order.status] || [];
  if (!allowedNextStatuses.includes(status)) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Cannot move order from ${order.status} to ${status}`
    );
  }

  if (status === "RETURNED") {
    return prisma.$transaction(async (tx) => {
      await restoreStockForOrder(tx, id);
      return tx.rentalOrder.update({ where: { id }, data: { status }, include: orderIncludes });
    });
  }

  return prisma.rentalOrder.update({ where: { id }, data: { status }, include: orderIncludes });
};

export const rentalService = {
  calculateRentalDays,
  createRentalOrder,
  getMyRentalOrders,
  getRentalOrderById,
  cancelRentalOrder,
  getProviderOrders,
  updateProviderOrderStatus,
};
