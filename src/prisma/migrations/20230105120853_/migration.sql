/*
  Warnings:

  - A unique constraint covering the columns `[id,transactionHash]` on the table `BurnEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,transactionHash]` on the table `CreateAccountEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,transactionHash]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,transactionHash]` on the table `MintEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,transactionHash]` on the table `NewBlockEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,transactionHash]` on the table `NewEpochEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,transactionHash]` on the table `ReceivedPaymentEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,transactionHash]` on the table `SentPaymentEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `BurnEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `CreateAccountEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `MintEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `NewBlockEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `NewEpochEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `ReceivedPaymentEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `SentPaymentEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BurnEvent_transactionHash_sequenceNumber_key";

-- DropIndex
DROP INDEX "CreateAccountEvent_transactionHash_sequenceNumber_key";

-- DropIndex
DROP INDEX "Event_transactionHash_sequenceNumber_key";

-- DropIndex
DROP INDEX "MintEvent_transactionHash_sequenceNumber_key";

-- DropIndex
DROP INDEX "NewBlockEvent_transactionHash_sequenceNumber_key";

-- DropIndex
DROP INDEX "NewEpochEvent_transactionHash_sequenceNumber_key";

-- DropIndex
DROP INDEX "ReceivedPaymentEvent_transactionHash_sequenceNumber_key";

-- DropIndex
DROP INDEX "SentPaymentEvent_transactionHash_sequenceNumber_key";

-- AlterTable
ALTER TABLE "BurnEvent" ADD COLUMN     "id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CreateAccountEvent" ADD COLUMN     "id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "MintEvent" ADD COLUMN     "id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "NewBlockEvent" ADD COLUMN     "id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "NewEpochEvent" ADD COLUMN     "id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ReceivedPaymentEvent" ADD COLUMN     "id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SentPaymentEvent" ADD COLUMN     "id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BurnEvent_id_transactionHash_key" ON "BurnEvent"("id", "transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "CreateAccountEvent_id_transactionHash_key" ON "CreateAccountEvent"("id", "transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "Event_id_transactionHash_key" ON "Event"("id", "transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "MintEvent_id_transactionHash_key" ON "MintEvent"("id", "transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "NewBlockEvent_id_transactionHash_key" ON "NewBlockEvent"("id", "transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "NewEpochEvent_id_transactionHash_key" ON "NewEpochEvent"("id", "transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "ReceivedPaymentEvent_id_transactionHash_key" ON "ReceivedPaymentEvent"("id", "transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "SentPaymentEvent_id_transactionHash_key" ON "SentPaymentEvent"("id", "transactionHash");
