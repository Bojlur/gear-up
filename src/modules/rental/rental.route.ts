import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { rentalController } from "./rental.controller";
import { rentalValidation } from "./rental.validation";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(rentalValidation.createRentalOrderValidationSchema),
  rentalController.createRentalOrder
);

router.get("/", auth(Role.CUSTOMER), rentalController.getMyRentalOrders);

router.get("/:id", auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), rentalController.getRentalOrderById);

router.patch("/:id/cancel", auth(Role.CUSTOMER), rentalController.cancelRentalOrder);

export const rentalRoutes = router;
