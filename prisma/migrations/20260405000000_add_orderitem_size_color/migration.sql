-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "selectedSize" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "selectedColor" TEXT;
