import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import config from "../src/config";

async function main() {
  const hashedPassword = await bcrypt.hash(config.admin_password, Number(config.bcrypt_salt_rounds));

  const admin = await prisma.user.upsert({
    where: { email: config.admin_email },
    update: {
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      name: config.admin_name,
      email: config.admin_email,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`Admin user ready: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
