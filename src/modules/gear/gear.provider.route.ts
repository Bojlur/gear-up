import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { gearController } from "./gear.controller";
import { gearValidation } from "./gear.validation";

const router = Router();

router.get("/", auth(Role.PROVIDER), gearController.getProviderGearItems);

router.post(
  "/",
  auth(Role.PROVIDER),
  validateRequest(gearValidation.createGearValidationSchema),
  gearController.createGearItem
);

router.put(
  "/:id",
  auth(Role.PROVIDER),
  validateRequest(gearValidation.updateGearValidationSchema),
  gearController.updateGearItem
);

router.delete("/:id", auth(Role.PROVIDER), gearController.deleteGearItem);

export const gearProviderRoutes = router;
