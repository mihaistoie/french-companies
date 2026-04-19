-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "EstablishmentType" AS ENUM ('PRIMARY', 'SECONDARY', 'UNKNOWN');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeNaf" (
    "code" VARCHAR(6) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "altCode" VARCHAR(6) NOT NULL,

    CONSTRAINT "CodeNaf_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "legalForm" VARCHAR(100),
    "establishmentType" "EstablishmentType" NOT NULL DEFAULT 'UNKNOWN',
    "holdingCompanyId" UUID,
    "siret" VARCHAR(14) NOT NULL,
    "siren" VARCHAR(9) NOT NULL,
    "codeNaf" VARCHAR(6),
    "legalUnitWorkforceRange" VARCHAR(2),
    "establishmentWorkforceRange" VARCHAR(2),
    "website" VARCHAR(2048),
    "email" VARCHAR(255),
    "phone" VARCHAR(32),
    "description" TEXT,
    "addressLine1" VARCHAR(255),
    "addressLine2" VARCHAR(255),
    "address" VARCHAR(600),
    "postalCode" VARCHAR(20),
    "city" VARCHAR(120),
    "country" VARCHAR(120) NOT NULL DEFAULT 'France',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CodeNaf_altCode_key" ON "CodeNaf"("altCode");

-- CreateIndex
CREATE INDEX "CodeNaf_altCode_idx" ON "CodeNaf"("altCode");

-- CreateIndex
CREATE UNIQUE INDEX "Company_siret_key" ON "Company"("siret");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Company_city_idx" ON "Company"("city");

-- CreateIndex
CREATE INDEX "Company_postalCode_idx" ON "Company"("postalCode");

-- CreateIndex
CREATE INDEX "Company_siren_idx" ON "Company"("siren");

-- CreateIndex
CREATE INDEX "Company_codeNaf_idx" ON "Company"("codeNaf");

-- CreateIndex
CREATE INDEX "Company_address_idx" ON "Company"("address");

-- CreateIndex
CREATE INDEX "Company_holdingCompanyId_idx" ON "Company"("holdingCompanyId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_codeNaf_fkey" FOREIGN KEY ("codeNaf") REFERENCES "CodeNaf"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_holdingCompanyId_fkey" FOREIGN KEY ("holdingCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
