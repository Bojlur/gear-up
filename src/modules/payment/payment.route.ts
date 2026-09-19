import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { paymentController } from "./payment.controller";
import { paymentValidation } from "./payment.validation";

const router = Router();

router.post(
  "/create",
  auth(Role.CUSTOMER),
  validateRequest(paymentValidation.createPaymentValidationSchema),
  paymentController.createCheckoutSession
);

router.post(
  "/confirm",
  auth(Role.CUSTOMER),
  validateRequest(paymentValidation.confirmPaymentValidationSchema),
  paymentController.confirmPayment
);

router.post("/webhook", paymentController.handleWebhook);

router.get("/", auth(Role.CUSTOMER), paymentController.getMyPayments);

router.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), paymentController.getPaymentById);

export const paymentRoutes = router;
