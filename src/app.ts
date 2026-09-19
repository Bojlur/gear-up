import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { authRoutes } from "./modules/auth/auth.routes";
import { categoryAdminRoutes } from "./modules/category/category.admin.route";
import { categoryRoutes } from "./modules/category/category.route";
import { gearProviderRoutes } from "./modules/gear/gear.provider.route";
import { gearRoutes } from "./modules/gear/gear.route";
import { rentalProviderRoutes } from "./modules/rental/rental.provider.route";
import { rentalRoutes } from "./modules/rental/rental.route";
import { userRoutes } from "./modules/user/user.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  })
);

// Stripe webhook needs the raw body, so it must be mounted before express.json()
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "GearUp API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin/categories", categoryAdminRoutes);
app.use("/api/gear", gearRoutes);
app.use("/api/provider/gear", gearProviderRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/provider/orders", rentalProviderRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
