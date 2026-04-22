-- CreateEnum
CREATE TYPE "token_type" AS ENUM ('verify_email', 'reset_password');

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

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_token_key" ON "verification_token"("token");

-- CreateIndex
CREATE INDEX "verification_token_account_id_idx" ON "verification_token"("account_id");

-- AddForeignKey
ALTER TABLE "verification_token" ADD CONSTRAINT "verification_token_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
