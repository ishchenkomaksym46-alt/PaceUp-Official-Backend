/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `trainings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "trainings_userId_key" ON "trainings"("userId");
