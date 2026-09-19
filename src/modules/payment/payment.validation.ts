import { z } from "zod";

const createPaymentValidationSchema = z.object({
  body: z.object({
    rentalOrderId: z.string({ error: "rentalOrderId is required" }).min(1, "rentalOrderId is required"),
    method: z.enum(["STRIPE", "SSLCOMMERZ"]).optional(),
  }),
});

const confirmPaymentValidationSchema = z.object({
  body: z.object({
    sessionId: z.string({ error: "sessionId is required" }).min(1, "sessionId is required"),
  }),
});

export const paymentValidation = {
  createPaymentValidationSchema,
  confirmPaymentValidationSchema,
};
