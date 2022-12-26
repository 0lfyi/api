-- CreateTable
CREATE TABLE "CommunityWallet" (
    "address" BYTEA NOT NULL,
    "description" TEXT NOT NULL,
    "link" TEXT,

    CONSTRAINT "CommunityWallet_pkey" PRIMARY KEY ("address")
);
