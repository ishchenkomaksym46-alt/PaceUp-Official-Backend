/*
  Warnings:

  - You are about to drop the `competition_distances` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `distances` to the `competitions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "competition_distances" DROP CONSTRAINT "competition_distances_competitionId_fkey";

-- AlterTable
ALTER TABLE "competitions" ADD COLUMN     "distances" JSONB NOT NULL;

-- DropTable
DROP TABLE "competition_distances";
