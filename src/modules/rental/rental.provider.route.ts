import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { rentalController } from "./rental.controller";
import { rentalValidation } from "./rental.validation";

const router = Router();

router.get("/", auth(Role.PROVIDER), rentalController.getProviderOrders);

router.patch(
  "/:id",
  auth(Role.PROVIDER),
  validateRequest(rentalValidation.updateProviderOrderStatusValidationSchema),
  rentalController.updateProviderOrderStatus
);

export const rentalProviderRoutes = router;
