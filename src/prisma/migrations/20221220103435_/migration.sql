-- CreateTable
CREATE TABLE "ValidatorPresence" (
    "id" UUID NOT NULL,
    "validatorId" UUID NOT NULL,
    "vfnLocation" Point,
    "validatorLocation" Point,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValidatorPresence_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ValidatorPresence" ADD CONSTRAINT "ValidatorPresence_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "Validator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
