-- CreateEnum
CREATE TYPE "EvaluationRseNote" AS ENUM ('A', 'B', 'C', 'D');

-- CreateTable
CREATE TABLE "evaluationRse" (
    "id" UUID NOT NULL,
    "estActive" BOOLEAN NOT NULL DEFAULT false,
    "entrepriseId" UUID NOT NULL,
    "dateEvaluation" DATE NOT NULL,
    "score" DECIMAL(4,2) NOT NULL,
    "note" "EvaluationRseNote" NOT NULL,

    CONSTRAINT "evaluationRse_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "evaluationRse_score_check" CHECK ("score" >= 1 AND "score" <= 5)
);

-- CreateIndex
CREATE INDEX "evaluationRse_entrepriseId_idx" ON "evaluationRse"("entrepriseId");

-- CreateIndex
CREATE INDEX "evaluationRse_dateEvaluation_idx" ON "evaluationRse"("dateEvaluation");

-- CreateIndex
CREATE UNIQUE INDEX "evaluationRse_entrepriseId_active_unique"
ON "evaluationRse"("entrepriseId")
WHERE "estActive" = true;

-- AddForeignKey
ALTER TABLE "evaluationRse"
ADD CONSTRAINT "evaluationRse_entrepriseId_fkey"
FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
