-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AlterTable
ALTER TABLE "ValidatorPresence" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
