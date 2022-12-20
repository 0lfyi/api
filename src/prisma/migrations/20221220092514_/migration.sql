-- AlterTable
ALTER TABLE "BurnEvent" ADD COLUMN     "transactionHash" BYTEA;

-- AlterTable
ALTER TABLE "CreateAccountEvent" ADD COLUMN     "transactionHash" BYTEA;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "transactionHash" BYTEA;

-- AlterTable
ALTER TABLE "MintEvent" ADD COLUMN     "transactionHash" BYTEA;

-- AlterTable
ALTER TABLE "NewBlockEvent" ADD COLUMN     "transactionHash" BYTEA;

-- AlterTable
ALTER TABLE "NewEpochEvent" ADD COLUMN     "transactionHash" BYTEA;

-- AlterTable
ALTER TABLE "ReceivedPaymentEvent" ADD COLUMN     "transactionHash" BYTEA;

-- AlterTable
ALTER TABLE "SentPaymentEvent" ADD COLUMN     "transactionHash" BYTEA;

-- CreateTable
CREATE TABLE "Validator" (
    "id" UUID NOT NULL,
    "accountAddress" BYTEA NOT NULL,
    "vfnIp" INET NOT NULL,
    "validatorIp" INET NOT NULL,

    CONSTRAINT "Validator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Validator_accountAddress_vfnIp_validatorIp_key" ON "Validator"("accountAddress", "vfnIp", "validatorIp");
