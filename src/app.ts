import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { authRoutes } from "./modules/auth/auth.routes";
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

app.use(notFound);
app.use(globalErrorHandler);

export default app;
