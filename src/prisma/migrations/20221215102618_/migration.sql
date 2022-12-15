-- CreateEnum
CREATE TYPE "VMStatus" AS ENUM ('Executed', 'OutOfGas', 'MoveAbort', 'ExecutionFailure', 'MiscellaneousError', 'VerificationError', 'DeserializationError', 'PublishingFailure', 'Unknown');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BlockMetadata', 'User', 'WriteSet', 'Unknown');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('Burn', 'CancelBurn', 'Mint', 'ToXDXExchangeRateUpdate', 'Preburn', 'ReceivedPayment', 'SentPayment', 'AdminTransaction', 'NewEpoch', 'NewBlock', 'ReceivedMint', 'ComplianceKeyRotation', 'BaseUrlRotation', 'CreateAccount', 'DiemIdDomain', 'Unknown');

-- CreateEnum
CREATE TYPE "AccountRole" AS ENUM ('ChildVASP', 'ParentVASP', 'DesignatedDealer', 'TreasuryCompliance', 'Unknown');

-- CreateTable
CREATE TABLE "Version" (
    "version" BIGINT NOT NULL,
    "accumulatorRootHash" BYTEA NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "scriptHashAllowList" BYTEA[],
    "modulePublishingAllowed" BOOLEAN,
    "diemVersion" BIGINT,
    "dualAttestationLimit" BIGINT
);

-- CreateTable
CREATE TABLE "Currency" (
    "code" TEXT NOT NULL,
    "fractionalPart" BIGINT NOT NULL,
    "scalingFactor" BIGINT NOT NULL,
    "mintEventsKey" TEXT NOT NULL,
    "burnEventsKey" TEXT NOT NULL,
    "preburnEventsKey" TEXT NOT NULL,
    "cancelBurnEventsKey" TEXT NOT NULL,
    "exchangeRateUpdateEventsKey" TEXT NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "hash" BYTEA NOT NULL,
    "version" BIGINT NOT NULL,
    "bytes" BYTEA NOT NULL,
    "gasUsed" BIGINT NOT NULL,
    "vmStatus" "VMStatus" NOT NULL,
    "type" "TransactionType" NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "UserTransaction" (
    "hash" BYTEA NOT NULL,
    "sender" BYTEA NOT NULL,
    "signatureScheme" TEXT NOT NULL,
    "signature" BYTEA NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "secondarySigners" BYTEA[],
    "secondarySignatureSchemes" BYTEA[],
    "secondarySignatures" BYTEA[],
    "secondaryPublicKeys" BYTEA[],
    "sequenceNumber" BIGINT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "maxGasAmount" BIGINT NOT NULL,
    "gasUnitPrice" BIGINT NOT NULL,
    "gasCurrency" TEXT NOT NULL,
    "expirationTimestampSecs" BIGINT NOT NULL,
    "scriptHash" BYTEA NOT NULL,
    "scriptBytes" BYTEA NOT NULL,
    "script" JSONB NOT NULL,

    CONSTRAINT "UserTransaction_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "BlockMetadataTransaction" (
    "hash" BYTEA NOT NULL,
    "timestampUsecs" BIGINT NOT NULL,

    CONSTRAINT "BlockMetadataTransaction_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "Event" (
    "key" BYTEA NOT NULL,
    "transactionVersion" BIGINT NOT NULL,
    "sequenceNumber" BIGINT NOT NULL,
    "type" "EventType" NOT NULL
);

-- CreateTable
CREATE TABLE "NewBlockEvent" (
    "transactionVersion" BIGINT NOT NULL,
    "sequenceNumber" BIGINT NOT NULL,
    "round" BIGINT NOT NULL,
    "proposer" BYTEA NOT NULL,
    "proposedTime" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "SentPaymentEvent" (
    "transactionVersion" BIGINT NOT NULL,
    "sequenceNumber" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,
    "receiver" BYTEA NOT NULL,
    "sender" BYTEA NOT NULL,
    "metadata" BYTEA NOT NULL
);

-- CreateTable
CREATE TABLE "ReceivedPaymentEvent" (
    "transactionVersion" BIGINT NOT NULL,
    "sequenceNumber" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,
    "receiver" BYTEA NOT NULL,
    "sender" BYTEA NOT NULL,
    "metadata" BYTEA NOT NULL
);

-- CreateTable
CREATE TABLE "CreateAccountEvent" (
    "transactionVersion" BIGINT NOT NULL,
    "sequenceNumber" BIGINT NOT NULL,
    "createdAddress" BYTEA NOT NULL,
    "roleId" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "MintEvent" (
    "transactionVersion" BIGINT NOT NULL,
    "sequenceNumber" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BurnEvent" (
    "transactionVersion" BIGINT NOT NULL,
    "sequenceNumber" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,
    "preburnAddress" BYTEA NOT NULL
);

-- CreateTable
CREATE TABLE "NewEpochEvent" (
    "transactionVersion" BIGINT NOT NULL,
    "sequenceNumber" BIGINT NOT NULL,
    "epoch" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "address" BYTEA NOT NULL,
    "sequenceNumber" BIGINT NOT NULL,
    "authenticationKey" BYTEA NOT NULL,
    "sentEventsKey" BYTEA NOT NULL,
    "receivedEventsKey" BYTEA NOT NULL,
    "delegatedKeyRotationCapability" BOOLEAN NOT NULL,
    "delegatedWithdrawalCapability" BOOLEAN NOT NULL,
    "isFrozen" BOOLEAN NOT NULL,
    "role" "AccountRole" NOT NULL,
    "version" BIGINT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("address")
);

-- CreateIndex
CREATE UNIQUE INDEX "Version_version_accumulatorRootHash_chainId_timestamp_key" ON "Version"("version", "accumulatorRootHash", "chainId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Event_transactionVersion_sequenceNumber_key" ON "Event"("transactionVersion", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "NewBlockEvent_transactionVersion_sequenceNumber_key" ON "NewBlockEvent"("transactionVersion", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SentPaymentEvent_transactionVersion_sequenceNumber_key" ON "SentPaymentEvent"("transactionVersion", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ReceivedPaymentEvent_transactionVersion_sequenceNumber_key" ON "ReceivedPaymentEvent"("transactionVersion", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CreateAccountEvent_transactionVersion_sequenceNumber_key" ON "CreateAccountEvent"("transactionVersion", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MintEvent_transactionVersion_sequenceNumber_key" ON "MintEvent"("transactionVersion", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BurnEvent_transactionVersion_sequenceNumber_key" ON "BurnEvent"("transactionVersion", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "NewEpochEvent_transactionVersion_sequenceNumber_key" ON "NewEpochEvent"("transactionVersion", "sequenceNumber");
