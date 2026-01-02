-- AlterTable
ALTER TABLE "Order" ADD COLUMN "cancelRequest" TEXT,
ADD COLUMN "returnRequest" TEXT,
ADD COLUMN "cancelReason" TEXT,
ADD COLUMN "returnReason" TEXT;

