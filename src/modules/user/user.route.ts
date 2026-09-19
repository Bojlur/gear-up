import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { userController } from "./user.controller";
import { userValidation } from "./user.validation";

const router = Router();

router.patch(
  "/me",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  validateRequest(userValidation.updateProfileValidationSchema),
  userController.updateMyProfile
);

export const userRoutes = router;
