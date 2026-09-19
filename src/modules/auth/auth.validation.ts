import { z } from "zod";

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string({ error: "Name is required" }).min(2, "Name must be at least 2 characters"),
    email: z.email({ error: "A valid email is required" }),
    password: z.string({ error: "Password is required" }).min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    address: z.string().optional(),
    role: z.enum(["CUSTOMER", "PROVIDER"], { error: "Role must be CUSTOMER or PROVIDER" }).optional(),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.email({ error: "A valid email is required" }),
    password: z.string({ error: "Password is required" }),
  }),
});

export const authValidation = {
  registerValidationSchema,
  loginValidationSchema,
};
