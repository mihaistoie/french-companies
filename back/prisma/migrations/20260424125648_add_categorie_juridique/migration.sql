/*
  Warnings:

  - You are about to drop the column `categorieJuridique` on the `Entreprise` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Entreprise" DROP COLUMN "categorieJuridique",
ADD COLUMN     "categorieJuridiqueCode" VARCHAR(4);

-- CreateTable
CREATE TABLE "CategorieJuridique" (
    "code" VARCHAR(4) NOT NULL,
    "title" VARCHAR(256) NOT NULL,

    CONSTRAINT "CategorieJuridique_pkey" PRIMARY KEY ("code")
);

-- AddForeignKey
ALTER TABLE "Entreprise" ADD CONSTRAINT "Entreprise_categorieJuridiqueCode_fkey" FOREIGN KEY ("categorieJuridiqueCode") REFERENCES "CategorieJuridique"("code") ON DELETE SET NULL ON UPDATE CASCADE;
