/*
  Warnings:

  - A unique constraint covering the columns `[fileName]` on the table `PastPaper` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PastPaper_fileName_key" ON "PastPaper"("fileName");
