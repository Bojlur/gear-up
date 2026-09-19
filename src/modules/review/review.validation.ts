import { z } from "zod";

const createReviewValidationSchema = z.object({
  body: z.object({
    gearItemId: z.string({ error: "gearItemId is required" }).min(1, "gearItemId is required"),
    rentalOrderId: z.string({ error: "rentalOrderId is required" }).min(1, "rentalOrderId is required"),
    rating: z.coerce
      .number({ error: "Rating is required" })
      .int("Rating must be a whole number")
      .min(1, "Rating must be between 1 and 5")
      .max(5, "Rating must be between 1 and 5"),
    comment: z.string().optional(),
  }),
});

export const reviewValidation = {
  createReviewValidationSchema,
};
