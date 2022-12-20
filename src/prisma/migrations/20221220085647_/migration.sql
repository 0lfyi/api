-- CreateIndex
CREATE INDEX "Transaction_version_idx" ON "Transaction"("version");

-- CreateIndex
CREATE INDEX "Version_version_idx" ON "Version"("version");

-- CreateIndex
CREATE INDEX "Version_timestamp_idx" ON "Version"("timestamp");
