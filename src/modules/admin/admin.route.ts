import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { adminController } from "./admin.controller";
import { adminValidation } from "./admin.validation";

const router = Router();

router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);

router.patch(
  "/users/:id",
  auth(Role.ADMIN),
  validateRequest(adminValidation.updateUserStatusValidationSchema),
  adminController.updateUserStatus
);

router.get("/gear", auth(Role.ADMIN), adminController.getAllGearItems);

router.get("/rentals", auth(Role.ADMIN), adminController.getAllRentalOrders);

export const adminRoutes = router;
