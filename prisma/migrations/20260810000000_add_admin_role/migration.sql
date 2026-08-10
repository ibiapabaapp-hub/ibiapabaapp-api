CREATE TYPE "account_role" AS ENUM ('user', 'admin', 'super_admin');

ALTER TABLE "account" ADD COLUMN "role" "account_role" NOT NULL DEFAULT 'user';

CREATE INDEX "account_role_idx" ON "account"("role");
