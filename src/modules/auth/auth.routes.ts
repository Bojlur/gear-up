import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { authController } from "./auth.controller";
import { authValidation } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(authValidation.registerValidationSchema),
  authController.registerUser
);

router.post("/login", validateRequest(authValidation.loginValidationSchema), authController.loginUser);

router.post("/refresh-token", authController.refreshToken);

router.post("/logout", authController.logoutUser);

router.get("/me", auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), authController.getMe);

export const authRoutes = router;
