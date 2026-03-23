-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "lead_type" AS ENUM ('resident', 'tourist', 'company');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('user', 'superuser');

-- CreateEnum
CREATE TYPE "reach_level" AS ENUM ('local', 'regional');

-- CreateEnum
CREATE TYPE "company_role" AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- CreateEnum
CREATE TYPE "event_type" AS ENUM ('simple', 'featured');

-- CreateEnum
CREATE TYPE "media_type" AS ENUM ('image', 'video');

-- CreateTable
CREATE TABLE "lead" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "type" "lead_type" NOT NULL,
    "company_name" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "city_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "city_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "parent_id" UUID,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cover_img_url" TEXT,
    "location" geometry(Point, 4326) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_company" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "role" "company_role" NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "user_company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_interest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(200) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "birth_date" DATE NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "company_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_city" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "city_id" UUID NOT NULL,
    "is_headquarter" BOOLEAN NOT NULL DEFAULT false,
    "adress_specific" VARCHAR,

    CONSTRAINT "company_city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(100) NOT NULL,
    "cnpj" VARCHAR(20),
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "cover_img_url" TEXT,
    "max_reach_level" "reach_level" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
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
    "adress_specific" VARCHAR,

    CONSTRAINT "event_city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(100) NOT NULL,
    "company_id" UUID,
    "user_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "cover_img_url" TEXT,
    "reach_level" "reach_level" NOT NULL,
    "type" "event_type" NOT NULL,
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
    "city_id" UUID,
    "event_id" UUID,
    "company_id" UUID,
    "media_type" "media_type" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "alt_text" TEXT,
    "credits" TEXT,
    "license" TEXT,
    "metadata" JSONB,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lead_email_key" ON "lead"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lead_phone_number_key" ON "lead"("phone_number");

-- CreateIndex
CREATE INDEX "city_category_city_id_idx" ON "city_category"("city_id");

-- CreateIndex
CREATE INDEX "city_category_category_id_idx" ON "city_category"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "city_category_city_id_category_id_key" ON "city_category"("city_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE INDEX "category_parent_id_idx" ON "category"("parent_id");

-- CreateIndex
CREATE INDEX "category_name_idx" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "city_slug_key" ON "city"("slug");

-- CreateIndex
CREATE INDEX "city_created_at_idx" ON "city"("created_at" DESC);

-- CreateIndex
CREATE INDEX "city_location_idx" ON "city" USING GIST ("location");

-- CreateIndex
CREATE INDEX "idx_user_company_user" ON "user_company"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_company_company" ON "user_company"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_user_company" ON "user_company"("user_id", "company_id");

-- CreateIndex
CREATE INDEX "user_interest_user_id_idx" ON "user_interest"("user_id");

-- CreateIndex
CREATE INDEX "user_interest_category_id_idx" ON "user_interest"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_interest_user_id_category_id_key" ON "user_interest"("user_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_number_key" ON "user"("phone_number");

-- CreateIndex
CREATE INDEX "company_category_company_id_idx" ON "company_category"("company_id");

-- CreateIndex
CREATE INDEX "company_category_category_id_idx" ON "company_category"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_category_company_id_category_id_key" ON "company_category"("company_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_slug_key" ON "company"("slug");

-- CreateIndex
CREATE INDEX "event_category_event_id_idx" ON "event_category"("event_id");

-- CreateIndex
CREATE INDEX "event_category_category_id_idx" ON "event_category"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_category_event_id_category_id_key" ON "event_category"("event_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_slug_key" ON "event"("slug");

-- CreateIndex
CREATE INDEX "event_user_id_idx" ON "event"("user_id");

-- CreateIndex
CREATE INDEX "event_company_id_idx" ON "event"("company_id");

-- CreateIndex
CREATE INDEX "media_city_id_idx" ON "media"("city_id");

-- CreateIndex
CREATE INDEX "media_event_id_idx" ON "media"("event_id");

-- CreateIndex
CREATE INDEX "media_company_id_idx" ON "media"("company_id");

-- AddForeignKey
ALTER TABLE "city_category" ADD CONSTRAINT "city_category_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_category" ADD CONSTRAINT "city_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_company" ADD CONSTRAINT "user_company_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_company" ADD CONSTRAINT "user_company_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interest" ADD CONSTRAINT "user_interest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interest" ADD CONSTRAINT "user_interest_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_category" ADD CONSTRAINT "company_category_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_category" ADD CONSTRAINT "company_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_city" ADD CONSTRAINT "company_city_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_city" ADD CONSTRAINT "company_city_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_category" ADD CONSTRAINT "event_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_category" ADD CONSTRAINT "event_category_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_city" ADD CONSTRAINT "event_city_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_city" ADD CONSTRAINT "event_city_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Media check constraint
ALTER TABLE "media"
ADD CONSTRAINT "media_single_entity_check"
CHECK (
  (city_id IS NOT NULL)::int +
  (event_id IS NOT NULL)::int +
  (company_id IS NOT NULL)::int = 1
);