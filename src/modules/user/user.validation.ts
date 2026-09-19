import { z } from "zod";

const updateProfileValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const userValidation = {
  updateProfileValidationSchema,
};
