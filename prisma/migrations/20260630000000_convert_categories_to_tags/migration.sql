-- CreateTable
CREATE TABLE "tag_group" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "tag_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7),
    "group_id" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_tag" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "city_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "city_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_tag" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "business_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_tag" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "event_tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tag_group_name_key" ON "tag_group"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tag_slug_key" ON "tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tag_group_id_name_key" ON "tag"("group_id", "name");

-- CreateIndex
CREATE INDEX "tag_group_id_idx" ON "tag"("group_id");

-- CreateIndex
CREATE INDEX "tag_slug_idx" ON "tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "city_tag_city_id_tag_id_key" ON "city_tag"("city_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_tag_business_id_tag_id_key" ON "business_tag"("business_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_tag_event_id_tag_id_key" ON "event_tag"("event_id", "tag_id");

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "tag_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_tag" ADD CONSTRAINT "city_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_tag" ADD CONSTRAINT "city_tag_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_tag" ADD CONSTRAINT "business_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_tag" ADD CONSTRAINT "business_tag_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tag" ADD CONSTRAINT "event_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tag" ADD CONSTRAINT "event_tag_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old tables
DROP TABLE "account_interest" CASCADE;
DROP TABLE "city_category" CASCADE;
DROP TABLE "business_category" CASCADE;
DROP TABLE "event_category" CASCADE;
DROP TABLE "category" CASCADE;

-- Drop old enum
DROP TYPE "entity_category";

-- Recreate account_interest with tag_id
CREATE TABLE "account_interest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "account_interest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_interest_account_id_tag_id_key" ON "account_interest"("account_id", "tag_id");

-- AddForeignKey
ALTER TABLE "account_interest" ADD CONSTRAINT "account_interest_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_interest" ADD CONSTRAINT "account_interest_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
