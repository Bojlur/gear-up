import { z } from "zod";

const createRentalOrderValidationSchema = z.object({
  body: z
    .object({
      startDate: z.coerce.date({ error: "A valid start date is required" }),
      endDate: z.coerce.date({ error: "A valid end date is required" }),
      items: z
        .array(
          z.object({
            gearItemId: z.string({ error: "gearItemId is required" }).min(1, "gearItemId is required"),
            quantity: z.coerce
              .number({ error: "Quantity is required" })
              .int()
              .positive("Quantity must be a positive integer"),
          })
        )
        .min(1, "At least one gear item is required"),
    })
    .refine((data) => data.startDate.getTime() >= new Date(new Date().toDateString()).getTime(), {
      message: "Start date cannot be in the past",
      path: ["startDate"],
    })
    .refine((data) => data.endDate.getTime() > data.startDate.getTime(), {
      message: "End date must be after start date",
      path: ["endDate"],
    }),
});

const updateProviderOrderStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(["CONFIRMED", "PICKED_UP", "RETURNED"], {
      error: "Status must be one of CONFIRMED, PICKED_UP, RETURNED",
    }),
  }),
});

export const rentalValidation = {
  createRentalOrderValidationSchema,
  updateProviderOrderStatusValidationSchema,
};
