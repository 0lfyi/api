/*
  Warnings:

  - You are about to drop the column `transactionVersion` on the `BurnEvent` table. All the data in the column will be lost.
  - You are about to drop the column `transactionVersion` on the `CreateAccountEvent` table. All the data in the column will be lost.
  - You are about to drop the column `transactionVersion` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `transactionVersion` on the `MintEvent` table. All the data in the column will be lost.
  - You are about to drop the column `transactionVersion` on the `NewBlockEvent` table. All the data in the column will be lost.
  - You are about to drop the column `transactionVersion` on the `NewEpochEvent` table. All the data in the column will be lost.
  - You are about to drop the column `transactionVersion` on the `ReceivedPaymentEvent` table. All the data in the column will be lost.
  - You are about to drop the column `transactionVersion` on the `SentPaymentEvent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionHash,sequenceNumber]` on the table `BurnEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionHash,sequenceNumber]` on the table `CreateAccountEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionHash,sequenceNumber]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionHash,sequenceNumber]` on the table `MintEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionHash,sequenceNumber]` on the table `NewBlockEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionHash,sequenceNumber]` on the table `NewEpochEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionHash,sequenceNumber]` on the table `ReceivedPaymentEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionHash,sequenceNumber]` on the table `SentPaymentEvent` will be added. If there are existing duplicate values, this will fail.
  - Made the column `transactionHash` on table `BurnEvent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `transactionHash` on table `CreateAccountEvent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `transactionHash` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `transactionHash` on table `MintEvent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `transactionHash` on table `NewBlockEvent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `transactionHash` on table `NewEpochEvent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `transactionHash` on table `ReceivedPaymentEvent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `transactionHash` on table `SentPaymentEvent` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "BurnEvent_transactionVersion_sequenceNumber_key";

-- DropIndex
DROP INDEX "CreateAccountEvent_transactionVersion_sequenceNumber_key";

-- DropIndex
DROP INDEX "Event_transactionVersion_sequenceNumber_key";

-- DropIndex
DROP INDEX "MintEvent_transactionVersion_sequenceNumber_key";

-- DropIndex
DROP INDEX "NewBlockEvent_transactionVersion_sequenceNumber_key";

-- DropIndex
DROP INDEX "NewEpochEvent_transactionVersion_sequenceNumber_key";

-- DropIndex
DROP INDEX "ReceivedPaymentEvent_transactionVersion_sequenceNumber_key";

-- DropIndex
DROP INDEX "SentPaymentEvent_transactionVersion_sequenceNumber_key";

-- AlterTable
ALTER TABLE "BurnEvent" DROP COLUMN "transactionVersion",
ALTER COLUMN "transactionHash" SET NOT NULL;

-- AlterTable
ALTER TABLE "CreateAccountEvent" DROP COLUMN "transactionVersion",
ALTER COLUMN "transactionHash" SET NOT NULL;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "transactionVersion",
ALTER COLUMN "transactionHash" SET NOT NULL;

-- AlterTable
ALTER TABLE "HistoricalGasUsage" ALTER COLUMN "gasUsed" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "MintEvent" DROP COLUMN "transactionVersion",
ALTER COLUMN "transactionHash" SET NOT NULL;

-- AlterTable
ALTER TABLE "NewBlockEvent" DROP COLUMN "transactionVersion",
ALTER COLUMN "transactionHash" SET NOT NULL;

-- AlterTable
ALTER TABLE "NewEpochEvent" DROP COLUMN "transactionVersion",
ALTER COLUMN "transactionHash" SET NOT NULL;

-- AlterTable
ALTER TABLE "ReceivedPaymentEvent" DROP COLUMN "transactionVersion",
ALTER COLUMN "transactionHash" SET NOT NULL;

-- AlterTable
ALTER TABLE "SentPaymentEvent" DROP COLUMN "transactionVersion",
ALTER COLUMN "transactionHash" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BurnEvent_transactionHash_sequenceNumber_key" ON "BurnEvent"("transactionHash", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CreateAccountEvent_transactionHash_sequenceNumber_key" ON "CreateAccountEvent"("transactionHash", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Event_transactionHash_sequenceNumber_key" ON "Event"("transactionHash", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MintEvent_transactionHash_sequenceNumber_key" ON "MintEvent"("transactionHash", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "NewBlockEvent_transactionHash_sequenceNumber_key" ON "NewBlockEvent"("transactionHash", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "NewEpochEvent_transactionHash_sequenceNumber_key" ON "NewEpochEvent"("transactionHash", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ReceivedPaymentEvent_transactionHash_sequenceNumber_key" ON "ReceivedPaymentEvent"("transactionHash", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SentPaymentEvent_transactionHash_sequenceNumber_key" ON "SentPaymentEvent"("transactionHash", "sequenceNumber");
