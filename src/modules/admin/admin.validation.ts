import { z } from "zod";

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "SUSPENDED"], { error: "Status must be ACTIVE or SUSPENDED" }),
  }),
});

export const adminValidation = {
  updateUserStatusValidationSchema,
};
