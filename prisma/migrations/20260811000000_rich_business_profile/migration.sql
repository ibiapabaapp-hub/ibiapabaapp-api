ALTER TABLE "business"
  ADD COLUMN "commercial_name" VARCHAR(150),
  ADD COLUMN "description" TEXT,
  ADD COLUMN "is_verified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "verified_at" TIMESTAMP(6),
  ADD COLUMN "accepts_payment" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "offers_delivery" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "in_person_service" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "accessibility" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "parking" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "wifi" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "business_city"
  ADD COLUMN "address" TEXT,
  ADD COLUMN "neighborhood" TEXT,
  ADD COLUMN "postal_code" VARCHAR(20),
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION,
  ADD COLUMN "map_url" TEXT;

CREATE UNIQUE INDEX "business_city_business_id_city_id_key" ON "business_city"("business_id", "city_id");
CREATE UNIQUE INDEX "business_one_headquarter_key" ON "business_city"("business_id") WHERE "is_headquarter" = true;

ALTER TABLE "media" ADD COLUMN "business_id" UUID, ADD COLUMN "alt_text" TEXT;
CREATE INDEX "media_business_id_idx" ON "media"("business_id");
ALTER TABLE "media" ADD CONSTRAINT "media_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "business_social_links" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "business_id" UUID NOT NULL,
  "phone" VARCHAR(30),
  "whatsapp" VARCHAR(30),
  "public_email" VARCHAR(255),
  "website" TEXT,
  "instagram" TEXT,
  "facebook" TEXT,
  CONSTRAINT "business_social_links_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "business_social_links_business_id_key" ON "business_social_links"("business_id");
ALTER TABLE "business_social_links" ADD CONSTRAINT "business_social_links_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "business_hours" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "business_id" UUID NOT NULL,
  "business_city_id" UUID,
  "weekday" SMALLINT NOT NULL,
  "is_closed" BOOLEAN NOT NULL DEFAULT false,
  "opens_at" VARCHAR(5),
  "closes_at" VARCHAR(5),
  "break_start" VARCHAR(5),
  "break_end" VARCHAR(5),
  CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "business_hours_business_id_business_city_id_weekday_key" ON "business_hours"("business_id", "business_city_id", "weekday");
CREATE INDEX "business_hours_business_id_idx" ON "business_hours"("business_id");
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_business_city_id_fkey" FOREIGN KEY ("business_city_id") REFERENCES "business_city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "business_hour_exception" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "business_id" UUID NOT NULL,
  "business_city_id" UUID,
  "date" DATE NOT NULL,
  "is_closed" BOOLEAN NOT NULL DEFAULT true,
  "opens_at" VARCHAR(5),
  "closes_at" VARCHAR(5),
  "reason" TEXT,
  CONSTRAINT "business_hour_exception_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "business_hour_exception_business_id_business_city_id_date_key" ON "business_hour_exception"("business_id", "business_city_id", "date");
CREATE INDEX "business_hour_exception_business_id_date_idx" ON "business_hour_exception"("business_id", "date");
ALTER TABLE "business_hour_exception" ADD CONSTRAINT "business_hour_exception_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_hour_exception" ADD CONSTRAINT "business_hour_exception_business_city_id_fkey" FOREIGN KEY ("business_city_id") REFERENCES "business_city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "business_service" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "business_id" UUID NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "description" TEXT,
  "price_from" DECIMAL(12,2),
  "price_to" DECIMAL(12,2),
  "price_label" VARCHAR(100),
  "booking_url" TEXT,
  "service_type" VARCHAR(50),
  "position" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "business_service_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "business_service_business_id_active_position_idx" ON "business_service"("business_id", "active", "position");
ALTER TABLE "business_service" ADD CONSTRAINT "business_service_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
