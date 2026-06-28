-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "lead_type" AS ENUM ('resident', 'tourist', 'business');

-- CreateEnum
CREATE TYPE "account_type" AS ENUM ('personal', 'business');

-- CreateEnum
CREATE TYPE "reach_level" AS ENUM ('local', 'regional');

-- CreateEnum
CREATE TYPE "event_type" AS ENUM ('simple', 'featured');

-- CreateEnum
CREATE TYPE "media_type" AS ENUM ('image', 'video');

-- CreateEnum
CREATE TYPE "entity_category" AS ENUM ('city', 'business', 'event');

-- CreateEnum
CREATE TYPE "token_type" AS ENUM ('verify_email', 'reset_password');

-- CreateTable
CREATE TABLE "account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(150) NOT NULL,
    "bio" TEXT,
    "avatar_url" TEXT,
    "type" "account_type" NOT NULL DEFAULT 'personal',
    "name" VARCHAR(50) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_token" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" VARCHAR(255) NOT NULL,
    "account_id" UUID NOT NULL,
    "type" "token_type" NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "used_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "cnpj" VARCHAR(20),
    "max_reach_level" "reach_level" NOT NULL DEFAULT 'local',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cover_img_url" TEXT,
    "location" geometry NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(100) NOT NULL,
    "owner_account_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "cover_img_url" TEXT,
    "reach_level" "reach_level" NOT NULL,
    "type" "event_type" NOT NULL DEFAULT 'simple',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID,
    "city_id" UUID,
    "event_id" UUID,
    "media_type" "media_type" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_favorite" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "city_id" UUID,
    "event_id" UUID,
    "business_id" UUID,

    CONSTRAINT "account_favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_interest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "account_interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "parent_id" UUID,
    "name" TEXT NOT NULL,
    "entities" "entity_category"[],

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "city_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "city_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "business_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_city" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL,
    "city_id" UUID NOT NULL,
    "is_headquarter" BOOLEAN NOT NULL DEFAULT false,
    "address_specific" TEXT,

    CONSTRAINT "business_city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "event_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_city" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "city_id" UUID NOT NULL,
    "address_specific" VARCHAR,

    CONSTRAINT "event_city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "type" "lead_type" NOT NULL,
    "business_name" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "business_id" UUID,
    "event_id" UUID,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_email_key" ON "account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "account_phone_number_key" ON "account"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "account_slug_key" ON "account"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_token_key" ON "verification_token"("token");

-- CreateIndex
CREATE INDEX "verification_token_account_id_idx" ON "verification_token"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_account_id_key" ON "business"("account_id");

-- CreateIndex
CREATE INDEX "business_account_id_idx" ON "business"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "city_slug_key" ON "city"("slug");

-- CreateIndex
CREATE INDEX "city_location_idx" ON "city" USING GIST ("location");

-- CreateIndex
CREATE UNIQUE INDEX "event_slug_key" ON "event"("slug");

-- CreateIndex
CREATE INDEX "event_owner_account_id_idx" ON "event"("owner_account_id");

-- CreateIndex
CREATE INDEX "account_favorite_account_id_idx" ON "account_favorite"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_favorite_account_id_city_id_key" ON "account_favorite"("account_id", "city_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_favorite_account_id_event_id_key" ON "account_favorite"("account_id", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_favorite_account_id_business_id_key" ON "account_favorite"("account_id", "business_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_interest_account_id_category_id_key" ON "account_interest"("account_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "city_category_city_id_category_id_key" ON "city_category"("city_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_category_business_id_category_id_key" ON "business_category"("business_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_category_event_id_category_id_key" ON "event_category"("event_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "lead_email_key" ON "lead"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lead_phone_number_key" ON "lead"("phone_number");

-- CreateIndex
CREATE INDEX "review_business_id_idx" ON "review"("business_id");

-- CreateIndex
CREATE INDEX "review_event_id_idx" ON "review"("event_id");

-- CreateIndex
CREATE INDEX "review_business_id_rating_idx" ON "review"("business_id", "rating");

-- CreateIndex
CREATE INDEX "review_event_id_rating_idx" ON "review"("event_id", "rating");

-- CreateIndex
CREATE INDEX "review_created_at_idx" ON "review"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "review_account_id_business_id_key" ON "review"("account_id", "business_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_account_id_event_id_key" ON "review"("account_id", "event_id");

-- AddForeignKey
ALTER TABLE "verification_token" ADD CONSTRAINT "verification_token_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business" ADD CONSTRAINT "business_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_owner_account_id_fkey" FOREIGN KEY ("owner_account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_favorite" ADD CONSTRAINT "account_favorite_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_favorite" ADD CONSTRAINT "account_favorite_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_favorite" ADD CONSTRAINT "account_favorite_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_favorite" ADD CONSTRAINT "account_favorite_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_interest" ADD CONSTRAINT "account_interest_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_interest" ADD CONSTRAINT "account_interest_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_category" ADD CONSTRAINT "city_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_category" ADD CONSTRAINT "city_category_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_category" ADD CONSTRAINT "business_category_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_category" ADD CONSTRAINT "business_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_city" ADD CONSTRAINT "business_city_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_city" ADD CONSTRAINT "business_city_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_category" ADD CONSTRAINT "event_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_category" ADD CONSTRAINT "event_category_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_city" ADD CONSTRAINT "event_city_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_city" ADD CONSTRAINT "event_city_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
