import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  port: process.env.PORT || 5000,
  node_env: process.env.NODE_ENV || "development",
  database_url: process.env.DATABASE_URL,
  app_url: process.env.APP_URL || "http://localhost:5000",

  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || "10",

  jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  admin_name: process.env.ADMIN_NAME || "GearUp Admin",
  admin_email: process.env.ADMIN_EMAIL as string,
  admin_password: process.env.ADMIN_PASSWORD as string,

  stripe_secret_key: process.env.STRIPE_SECRET_KEY as string,
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET as string,
};
