import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { reviewController } from "./review.controller";
import { reviewValidation } from "./review.validation";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(reviewValidation.createReviewValidationSchema),
  reviewController.createReview
);

router.get("/gear/:gearItemId", reviewController.getReviewsForGear);

export const reviewRoutes = router;
