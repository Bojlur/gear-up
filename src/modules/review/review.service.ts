import httpStatus from "http-status";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateReview } from "./review.interface";

const createReview = async (customerId: string, payload: ICreateReview) => {
  const { gearItemId, rentalOrderId, rating, comment } = payload;

  const order = await prisma.rentalOrder.findUniqueOrThrow({
    where: { id: rentalOrderId },
    include: { items: true },
  });

  if (order.customerId !== customerId) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have access to this rental order");
  }

  if (order.status !== "RETURNED") {
    throw new AppError(httpStatus.BAD_REQUEST, "You can only review gear after the rental has been returned");
  }

  const hasItem = order.items.some((item) => item.gearItemId === gearItemId);
  if (!hasItem) {
    throw new AppError(httpStatus.BAD_REQUEST, "This gear item is not part of the specified rental order");
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      customerId_gearItemId_rentalOrderId: { customerId, gearItemId, rentalOrderId },
    },
  });

  if (existingReview) {
    throw new AppError(httpStatus.CONFLICT, "You have already reviewed this gear item for this rental order");
  }

  return prisma.review.create({
    data: { customerId, gearItemId, rentalOrderId, rating, comment },
    include: { customer: { select: { id: true, name: true } } },
  });
};

const getReviewsForGear = async (gearItemId: string) => {
  await prisma.gearItem.findUniqueOrThrow({ where: { id: gearItemId } });

  const [reviews, aggregate] = await Promise.all([
    prisma.review.findMany({
      where: { gearItemId },
      include: { customer: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.aggregate({
      where: { gearItemId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  return {
    reviews,
    averageRating: aggregate._avg.rating ?? 0,
    totalReviews: aggregate._count.rating,
  };
};

export const reviewService = {
  createReview,
  getReviewsForGear,
};
