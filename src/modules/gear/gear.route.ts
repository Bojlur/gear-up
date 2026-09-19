import { Router } from "express";
import { gearController } from "./gear.controller";

const router = Router();

router.get("/", gearController.getAllGearItems);
router.get("/:id", gearController.getGearItemById);

export const gearRoutes = router;
