import { z } from "zod";

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string({ error: "Category name is required" }).min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
  }),
});

const updateCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    description: z.string().optional(),
  }),
});

export const categoryValidation = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
};
