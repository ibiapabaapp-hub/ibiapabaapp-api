-- CreateTable
CREATE TABLE "CompanyCategory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "CompanyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyCategory_company_id_idx" ON "CompanyCategory"("company_id");

-- CreateIndex
CREATE INDEX "CompanyCategory_category_id_idx" ON "CompanyCategory"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCategory_company_id_category_id_key" ON "CompanyCategory"("company_id", "category_id");

-- AddForeignKey
ALTER TABLE "CompanyCategory" ADD CONSTRAINT "CompanyCategory_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCategory" ADD CONSTRAINT "CompanyCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
