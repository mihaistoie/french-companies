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
CREATE TABLE "Entreprise" (
    "id" UUID NOT NULL,
    "raisonSociale" VARCHAR(255) NOT NULL,
    "categorieJuridique" VARCHAR(100),
    "etablissementSiege" "EstablishmentType" NOT NULL DEFAULT 'UNKNOWN',
    "idSocieteMere" UUID,
    "siret" VARCHAR(14) NOT NULL,
    "siren" VARCHAR(9) NOT NULL,
    "codeNaf" VARCHAR(6),
    "trancheEffectifsUniteLegale" VARCHAR(2),
    "trancheEffectifsEtablissement" VARCHAR(2),
    "siteWeb" VARCHAR(2048),
    "email" VARCHAR(255),
    "telephone" VARCHAR(32),
    "description" TEXT,
    "addressLine1" VARCHAR(255),
    "addressLine2" VARCHAR(255),
    "adresse" VARCHAR(600),
    "codePostal" VARCHAR(20),
    "ville" VARCHAR(120),
    "pays" VARCHAR(120) NOT NULL DEFAULT 'France',
    "estActive" BOOLEAN NOT NULL DEFAULT true,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateMiseAJour" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entreprise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CodeNaf_altCode_key" ON "CodeNaf"("altCode");

-- CreateIndex
CREATE INDEX "CodeNaf_altCode_idx" ON "CodeNaf"("altCode");

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_siret_key" ON "Entreprise"("siret");

-- CreateIndex
CREATE INDEX "Entreprise_raisonSociale_idx" ON "Entreprise"("raisonSociale");

-- CreateIndex
CREATE INDEX "Entreprise_ville_idx" ON "Entreprise"("ville");

-- CreateIndex
CREATE INDEX "Entreprise_codePostal_idx" ON "Entreprise"("codePostal");

-- CreateIndex
CREATE INDEX "Entreprise_siren_idx" ON "Entreprise"("siren");

-- CreateIndex
CREATE INDEX "Entreprise_codeNaf_idx" ON "Entreprise"("codeNaf");

-- CreateIndex
CREATE INDEX "Entreprise_adresse_idx" ON "Entreprise"("adresse");

-- CreateIndex
CREATE INDEX "Entreprise_idSocieteMere_idx" ON "Entreprise"("idSocieteMere");

-- AddForeignKey
ALTER TABLE "Entreprise" ADD CONSTRAINT "Entreprise_codeNaf_fkey" FOREIGN KEY ("codeNaf") REFERENCES "CodeNaf"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entreprise" ADD CONSTRAINT "Entreprise_idSocieteMere_fkey" FOREIGN KEY ("idSocieteMere") REFERENCES "Entreprise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
