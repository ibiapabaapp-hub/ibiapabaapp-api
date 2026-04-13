-- CreateEnum
CREATE TYPE "CategoryEntity" AS ENUM ('city', 'company', 'event');

-- AlterTable
ALTER TABLE "category" ADD COLUMN     "entities" "CategoryEntity"[];
