-- CreateTable
CREATE TABLE "HistoricalGasUsage" (
    "gasUsed" INTEGER NOT NULL,
    "volume" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "TransactionType" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalGasUsage_date_type_key" ON "HistoricalGasUsage"("date", "type");
