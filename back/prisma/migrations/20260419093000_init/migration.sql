-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "EstablishmentType" AS ENUM ('PRIMARY', 'SECONDARY', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "EvaluationRseNote" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');

-- CreateEnum
CREATE TYPE "MedailleEcovadis" AS ENUM ('PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'COMMITTED', 'FAST_MOVER', 'OTHER');

-- CreateEnum
CREATE TYPE "BilanCarboneScope" AS ENUM ('NON_PRECISE', '1', '1 2', '1 2 3');

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
CREATE TABLE "Entreprise" (
    "id" UUID NOT NULL,
    "raisonSociale" VARCHAR(255) NOT NULL,
    "categorieJuridiqueCode" VARCHAR(4),
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

-- CreateTable
CREATE TABLE "CodeNaf" (
    "code" VARCHAR(6) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "altCode" VARCHAR(6) NOT NULL,

    CONSTRAINT "CodeNaf_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "CategorieJuridique" (
    "code" VARCHAR(4) NOT NULL,
    "title" VARCHAR(256) NOT NULL,

    CONSTRAINT "CategorieJuridique_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "EvaluationRse" (
    "id" UUID NOT NULL,
    "estActive" BOOLEAN NOT NULL DEFAULT false,
    "entrepriseId" UUID NOT NULL,
    "dateEvaluation" DATE NOT NULL,
    "score" DECIMAL(4,2) NOT NULL,
    "note" "EvaluationRseNote" NOT NULL,

    CONSTRAINT "EvaluationRse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabelsEngagementsRse" (
    "id" UUID NOT NULL,
    "evaluationRseId" UUID NOT NULL,
    "aReportingRse" BOOLEAN NOT NULL DEFAULT false,
    "reportingRseDetail" TEXT,
    "aEvaluationEcovadis" BOOLEAN NOT NULL DEFAULT false,
    "medailleEcovadis" "MedailleEcovadis" NOT NULL DEFAULT 'OTHER',
    "anneeScoreEcovadis" TEXT,
    "estSocieteAMission" BOOLEAN NOT NULL DEFAULT false,
    "estSignataireGlobalCompact" BOOLEAN NOT NULL DEFAULT false,
    "globalCompactDetail" TEXT,
    "score" DECIMAL(4,2) NOT NULL,
    "note" "EvaluationRseNote" NOT NULL,

    CONSTRAINT "LabelsEngagementsRse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndicateursEnvironnementaux" (
    "id" UUID NOT NULL,
    "evaluationRseId" UUID NOT NULL,
    "bilanCarbone" BOOLEAN NOT NULL DEFAULT false,
    "bilanCarboneScope" "BilanCarboneScope" NOT NULL DEFAULT 'NON_PRECISE',
    "bilanCarboneDetail" TEXT,
    "decarbonisation" BOOLEAN NOT NULL DEFAULT false,
    "decarbonisationDetail" TEXT,
    "qpENR" BOOLEAN NOT NULL DEFAULT false,
    "qpENRDetail" TEXT,
    "iso14001" BOOLEAN NOT NULL DEFAULT false,
    "iso14001Detail" TEXT,
    "iso50001" BOOLEAN NOT NULL DEFAULT false,
    "iso50001Detail" TEXT,
    "recyclageDechets" BOOLEAN NOT NULL DEFAULT false,
    "recyclageDechetsDetail" TEXT,
    "autresEnv" BOOLEAN NOT NULL DEFAULT false,
    "autresEnvDetail" TEXT,
    "score" DECIMAL(4,2) NOT NULL,
    "note" "EvaluationRseNote" NOT NULL,

    CONSTRAINT "IndicateursEnvironnementaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndicateursSociaux" (
    "id" UUID NOT NULL,
    "evaluationRseId" UUID NOT NULL,
    "iso45001" BOOLEAN NOT NULL DEFAULT false,
    "iso45001Detail" TEXT,
    "ess" BOOLEAN NOT NULL DEFAULT false,
    "aEvaluationQvt" BOOLEAN NOT NULL DEFAULT false,
    "detailEvaluationQvt" TEXT,
    "aLabelEmployeur" BOOLEAN NOT NULL DEFAULT false,
    "detailLabelEmployeur" TEXT,
    "aVieAssociativeLocale" BOOLEAN NOT NULL DEFAULT false,
    "detailVieAssociativeLocale" TEXT,
    "aEgaliteHF" BOOLEAN NOT NULL DEFAULT false,
    "detailEgaliteHF" TEXT,
    "aAutresSocial" BOOLEAN NOT NULL DEFAULT false,
    "detailAutresSocial" TEXT,
    "score" DECIMAL(4,2) NOT NULL,
    "note" "EvaluationRseNote" NOT NULL,

    CONSTRAINT "IndicateursSociaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndicateursGouvernanceRse" (
    "id" UUID NOT NULL,
    "evaluationRseId" UUID NOT NULL,
    "aGouvernanceRse" BOOLEAN NOT NULL DEFAULT false,
    "detailGouvernanceRse" TEXT,
    "aEthique" BOOLEAN NOT NULL DEFAULT false,
    "detailEthique" TEXT,
    "aEnquetesPartenaires" BOOLEAN NOT NULL DEFAULT false,
    "detailEnquetesPartenaires" TEXT,
    "charteAchats" BOOLEAN NOT NULL DEFAULT false,
    "labelRfar" BOOLEAN NOT NULL DEFAULT false,
    "certifFscPefc" BOOLEAN NOT NULL DEFAULT false,
    "aAutresGouvernance" BOOLEAN NOT NULL DEFAULT false,
    "detailAutresGouvernance" TEXT,
    "score" DECIMAL(4,2) NOT NULL,
    "note" "EvaluationRseNote" NOT NULL,

    CONSTRAINT "IndicateursGouvernanceRse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

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

-- CreateIndex
CREATE UNIQUE INDEX "CodeNaf_altCode_key" ON "CodeNaf"("altCode");

-- CreateIndex
CREATE INDEX "CodeNaf_altCode_idx" ON "CodeNaf"("altCode");

-- CreateIndex
CREATE INDEX "EvaluationRse_entrepriseId_idx" ON "EvaluationRse"("entrepriseId");

-- CreateIndex
CREATE INDEX "EvaluationRse_dateEvaluation_idx" ON "EvaluationRse"("dateEvaluation");

-- CreateIndex
CREATE UNIQUE INDEX "LabelsEngagementsRse_evaluationRseId_key" ON "LabelsEngagementsRse"("evaluationRseId");

-- CreateIndex
CREATE INDEX "LabelsEngagementsRse_evaluationRseId_idx" ON "LabelsEngagementsRse"("evaluationRseId");

-- CreateIndex
CREATE UNIQUE INDEX "IndicateursEnvironnementaux_evaluationRseId_key" ON "IndicateursEnvironnementaux"("evaluationRseId");

-- CreateIndex
CREATE INDEX "IndicateursEnvironnementaux_evaluationRseId_idx" ON "IndicateursEnvironnementaux"("evaluationRseId");

-- CreateIndex
CREATE UNIQUE INDEX "IndicateursSociaux_evaluationRseId_key" ON "IndicateursSociaux"("evaluationRseId");

-- CreateIndex
CREATE INDEX "IndicateursSociaux_evaluationRseId_idx" ON "IndicateursSociaux"("evaluationRseId");

-- CreateIndex
CREATE UNIQUE INDEX "IndicateursGouvernanceRse_evaluationRseId_key" ON "IndicateursGouvernanceRse"("evaluationRseId");

-- CreateIndex
CREATE INDEX "IndicateursGouvernanceRse_evaluationRseId_idx" ON "IndicateursGouvernanceRse"("evaluationRseId");

-- AddForeignKey
ALTER TABLE "Entreprise" ADD CONSTRAINT "Entreprise_categorieJuridiqueCode_fkey" FOREIGN KEY ("categorieJuridiqueCode") REFERENCES "CategorieJuridique"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entreprise" ADD CONSTRAINT "Entreprise_codeNaf_fkey" FOREIGN KEY ("codeNaf") REFERENCES "CodeNaf"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entreprise" ADD CONSTRAINT "Entreprise_idSocieteMere_fkey" FOREIGN KEY ("idSocieteMere") REFERENCES "Entreprise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationRse" ADD CONSTRAINT "EvaluationRse_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelsEngagementsRse" ADD CONSTRAINT "LabelsEngagementsRse_evaluationRseId_fkey" FOREIGN KEY ("evaluationRseId") REFERENCES "EvaluationRse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicateursEnvironnementaux" ADD CONSTRAINT "IndicateursEnvironnementaux_evaluationRseId_fkey" FOREIGN KEY ("evaluationRseId") REFERENCES "EvaluationRse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicateursSociaux" ADD CONSTRAINT "IndicateursSociaux_evaluationRseId_fkey" FOREIGN KEY ("evaluationRseId") REFERENCES "EvaluationRse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicateursGouvernanceRse" ADD CONSTRAINT "IndicateursGouvernanceRse_evaluationRseId_fkey" FOREIGN KEY ("evaluationRseId") REFERENCES "EvaluationRse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
