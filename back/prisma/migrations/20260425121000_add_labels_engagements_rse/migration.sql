-- CreateTable
CREATE TABLE "labelsEngagementsRse" (
    "id" UUID NOT NULL,
    "evaluationRseId" UUID NOT NULL,
    "aReportingRse" BOOLEAN NOT NULL DEFAULT false,
    "reportingRseDetail" TEXT,
    "aEvaluationEcovadis" BOOLEAN NOT NULL DEFAULT false,
    "medailleEcovadis" TEXT,
    "anneeScoreEcovadis" VARCHAR(20),
    "estSocieteAMission" BOOLEAN NOT NULL DEFAULT false,
    "estSignataireGlobalCompact" BOOLEAN NOT NULL DEFAULT false,
    "globalCompactDetail" TEXT,
    "score" DECIMAL(4,2) NOT NULL,
    "note" "EvaluationRseNote" NOT NULL,

    CONSTRAINT "labelsEngagementsRse_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "labelsEngagementsRse_score_check" CHECK ("score" >= 1 AND "score" <= 5)
);

-- CreateIndex
CREATE UNIQUE INDEX "labelsEngagementsRse_evaluationRseId_key"
ON "labelsEngagementsRse"("evaluationRseId");

-- CreateIndex
CREATE INDEX "labelsEngagementsRse_evaluationRseId_idx"
ON "labelsEngagementsRse"("evaluationRseId");

-- AddForeignKey
ALTER TABLE "labelsEngagementsRse"
ADD CONSTRAINT "labelsEngagementsRse_evaluationRseId_fkey"
FOREIGN KEY ("evaluationRseId") REFERENCES "evaluationRse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
