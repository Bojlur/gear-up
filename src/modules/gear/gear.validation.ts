import { z } from "zod";

const createGearValidationSchema = z.object({
  body: z.object({
    name: z.string({ error: "Gear name is required" }).min(2, "Name must be at least 2 characters"),
    description: z
      .string({ error: "Description is required" })
      .min(10, "Description must be at least 10 characters"),
    brand: z.string().optional(),
    images: z.array(z.url("Each image must be a valid URL")).optional(),
    pricePerDay: z.coerce.number({ error: "Price per day is required" }).positive("Price must be positive"),
    stock: z.coerce.number({ error: "Stock is required" }).int().positive("Stock must be a positive integer"),
    specifications: z.record(z.string(), z.unknown()).optional(),
    categoryId: z.string({ error: "Category is required" }).min(1, "Category is required"),
    isAvailable: z.boolean().optional(),
  }),
});

const updateGearValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    brand: z.string().optional(),
    images: z.array(z.url("Each image must be a valid URL")).optional(),
    pricePerDay: z.coerce.number().positive("Price must be positive").optional(),
    stock: z.coerce.number().int().positive("Stock must be a positive integer").optional(),
    specifications: z.record(z.string(), z.unknown()).optional(),
    categoryId: z.string().min(1).optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const gearValidation = {
  createGearValidationSchema,
  updateGearValidationSchema,
};
