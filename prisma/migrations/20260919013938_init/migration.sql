-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'PROVIDER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('PLACED', 'CONFIRMED', 'CANCELLED', 'PAID', 'PICKED_UP', 'RETURNED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'SSLCOMMERZ');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gear_items" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "brand" VARCHAR(255),
    "images" TEXT[],
    "pricePerDay" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 1,
    "availableStock" INTEGER NOT NULL DEFAULT 1,
    "specifications" JSONB,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "providerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gear_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "stripeSessionId" TEXT,
    "rentalOrderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_orders" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "RentalStatus" NOT NULL DEFAULT 'PLACED',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_order_items" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "pricePerDay" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "rentalOrderId" TEXT NOT NULL,
    "gearItemId" TEXT NOT NULL,

    CONSTRAINT "rental_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "customerId" TEXT NOT NULL,
    "gearItemId" TEXT NOT NULL,
    "rentalOrderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "gear_items_providerId_idx" ON "gear_items"("providerId");

-- CreateIndex
CREATE INDEX "gear_items_categoryId_idx" ON "gear_items"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeSessionId_key" ON "payments"("stripeSessionId");

-- CreateIndex
CREATE INDEX "payments_rentalOrderId_idx" ON "payments"("rentalOrderId");

-- CreateIndex
CREATE INDEX "rental_orders_customerId_idx" ON "rental_orders"("customerId");

-- CreateIndex
CREATE INDEX "rental_order_items_rentalOrderId_idx" ON "rental_order_items"("rentalOrderId");

-- CreateIndex
CREATE INDEX "rental_order_items_gearItemId_idx" ON "rental_order_items"("gearItemId");

-- CreateIndex
CREATE INDEX "reviews_gearItemId_idx" ON "reviews"("gearItemId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_customerId_gearItemId_rentalOrderId_key" ON "reviews"("customerId", "gearItemId", "rentalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "gear_items" ADD CONSTRAINT "gear_items_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gear_items" ADD CONSTRAINT "gear_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "rental_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_orders" ADD CONSTRAINT "rental_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_order_items" ADD CONSTRAINT "rental_order_items_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "rental_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_order_items" ADD CONSTRAINT "rental_order_items_gearItemId_fkey" FOREIGN KEY ("gearItemId") REFERENCES "gear_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_gearItemId_fkey" FOREIGN KEY ("gearItemId") REFERENCES "gear_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "rental_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
