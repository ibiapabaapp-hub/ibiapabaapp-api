-- CreateTable
CREATE TABLE "profile_favorite" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "city_id" UUID,
    "event_id" UUID,
    "business_profile_id" UUID,

    CONSTRAINT "profile_favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_favorite_profile_id_city_id_key" ON "profile_favorite"("profile_id", "city_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_favorite_profile_id_event_id_key" ON "profile_favorite"("profile_id", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_favorite_profile_id_business_profile_id_key" ON "profile_favorite"("profile_id", "business_profile_id");

-- AddForeignKey
ALTER TABLE "profile_favorite" ADD CONSTRAINT "profile_favorite_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_favorite" ADD CONSTRAINT "profile_favorite_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_favorite" ADD CONSTRAINT "profile_favorite_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_favorite" ADD CONSTRAINT "profile_favorite_business_profile_id_fkey" FOREIGN KEY ("business_profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
