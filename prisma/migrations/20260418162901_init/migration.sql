-- CreateTable
CREATE TABLE "CodeNaf" (
    "code" VARCHAR(6) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "altCode" VARCHAR(6) NOT NULL,

    CONSTRAINT "CodeNaf_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeNaf_altCode_key" ON "CodeNaf"("altCode");

-- CreateIndex
CREATE INDEX "CodeNaf_altCode_idx" ON "CodeNaf"("altCode");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_codeNaf_fkey" FOREIGN KEY ("codeNaf") REFERENCES "CodeNaf"("code") ON DELETE SET NULL ON UPDATE CASCADE;
