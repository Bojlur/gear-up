import httpStatus from "http-status";
import Stripe from "stripe";
import config from "../../config";
import { AppError } from "../../errors/AppError";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import { ICreatePaymentSession } from "./payment.interface";

const assertOrderPayable = async (rentalOrderId: string, customerId: string) => {
  const order = await prisma.rentalOrder.findUniqueOrThrow({ where: { id: rentalOrderId } });

  if (order.customerId !== customerId) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have access to this rental order");
  }

  if (order.status === "PLACED") {
    throw new AppError(httpStatus.BAD_REQUEST, "Order must be confirmed by the provider before payment");
  }

  if (order.status === "CANCELLED") {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot pay for a cancelled order");
  }

  if (order.status !== "CONFIRMED") {
    throw new AppError(httpStatus.CONFLICT, "This order has already been paid");
  }

  return order;
};

const createCheckoutSession = async (customerId: string, payload: ICreatePaymentSession) => {
  const { rentalOrderId, method } = payload;

  if (method && method !== "STRIPE") {
    throw new AppError(httpStatus.BAD_REQUEST, `${method} is not supported yet. Use STRIPE.`);
  }

  const order = await assertOrderPayable(rentalOrderId, customerId);
  const customer = await prisma.user.findUniqueOrThrow({ where: { id: customerId } });

  const amountInCents = Math.round(order.totalAmount.toNumber() * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customer.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountInCents,
          product_data: {
            name: `GearUp Rental Order #${order.id.slice(0, 8)}`,
            description: `Rental from ${order.startDate.toDateString()} to ${order.endDate.toDateString()}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${config.app_url}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.app_url}/api/payments/cancel?rentalOrderId=${order.id}`,
    metadata: { rentalOrderId: order.id, customerId },
  });

  const payment = await prisma.payment.create({
    data: {
      transactionId: session.id,
      amount: order.totalAmount,
      method: "STRIPE",
      status: "PENDING",
      stripeSessionId: session.id,
      rentalOrderId: order.id,
    },
  });

  return { paymentUrl: session.url, sessionId: session.id, payment };
};

const fulfillCheckoutSession = async (session: Stripe.Checkout.Session) => {
  const payment = await prisma.payment.findUnique({ where: { stripeSessionId: session.id } });

  if (!payment || payment.status === "COMPLETED") return;

  if (session.payment_status === "unpaid") return;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED", paidAt: new Date() },
    });
    await tx.rentalOrder.update({ where: { id: payment.rentalOrderId }, data: { status: "PAID" } });
  });
};

const markCheckoutSessionFailed = async (session: Stripe.Checkout.Session) => {
  const payment = await prisma.payment.findUnique({ where: { stripeSessionId: session.id } });
  if (!payment || payment.status === "COMPLETED") return;

  await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
};

const confirmPayment = async (customerId: string, sessionId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: sessionId },
    include: { rentalOrder: true },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment session not found");
  }

  if (payment.rentalOrder.customerId !== customerId) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have access to this payment");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === "unpaid") {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment has not been completed yet");
  }

  await fulfillCheckoutSession(session);

  return prisma.payment.findUniqueOrThrow({ where: { id: payment.id }, include: { rentalOrder: true } });
};

const handleWebhookEvent = async (rawBody: Buffer, signature: string) => {
  const event = stripe.webhooks.constructEvent(rawBody, signature, config.stripe_webhook_secret);

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await fulfillCheckoutSession(event.data.object as Stripe.Checkout.Session);
      break;
    case "checkout.session.async_payment_failed":
      await markCheckoutSessionFailed(event.data.object as Stripe.Checkout.Session);
      break;
    default:
      break;
  }
};

const getMyPayments = async (customerId: string) => {
  return prisma.payment.findMany({
    where: { rentalOrder: { customerId } },
    include: { rentalOrder: true },
    orderBy: { createdAt: "desc" },
  });
};

const getPaymentById = async (id: string, userId: string, role: string) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id },
    include: { rentalOrder: true },
  });

  if (payment.rentalOrder.customerId !== userId && role !== "ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have access to this payment");
  }

  return payment;
};

export const paymentService = {
  createCheckoutSession,
  confirmPayment,
  handleWebhookEvent,
  getMyPayments,
  getPaymentById,
};
