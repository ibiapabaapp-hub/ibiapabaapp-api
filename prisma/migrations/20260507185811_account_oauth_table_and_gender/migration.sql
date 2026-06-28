/*
  Warnings:

  - You are about to drop the column `account_id` on the `business` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[owner_account_id]` on the table `business` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `owner_account_id` to the `business` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "oauth_provider" AS ENUM ('google');

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say');

-- DropForeignKey
ALTER TABLE "business" DROP CONSTRAINT "business_account_id_fkey";

-- DropIndex
DROP INDEX "business_account_id_idx";

-- DropIndex
DROP INDEX "business_account_id_key";

-- AlterTable
ALTER TABLE "account" ADD COLUMN     "gender" "gender",
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "phone_number" DROP NOT NULL,
ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "business" DROP COLUMN "account_id",
ADD COLUMN     "owner_account_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "account_oauth" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "provider" "oauth_provider" NOT NULL,
    "provider_uid" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "account_oauth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "account_oauth_account_id_idx" ON "account_oauth"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_oauth_provider_provider_uid_key" ON "account_oauth"("provider", "provider_uid");

-- CreateIndex
CREATE UNIQUE INDEX "account_oauth_provider_email_key" ON "account_oauth"("provider", "email");

-- CreateIndex
CREATE UNIQUE INDEX "business_owner_account_id_key" ON "business"("owner_account_id");

-- CreateIndex
CREATE INDEX "business_owner_account_id_idx" ON "business"("owner_account_id");

-- AddForeignKey
ALTER TABLE "account_oauth" ADD CONSTRAINT "account_oauth_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business" ADD CONSTRAINT "business_owner_account_id_fkey" FOREIGN KEY ("owner_account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
