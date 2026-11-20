/*
  Warnings:

  - Added the required column `sport` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "sport" TEXT NOT NULL,
ADD COLUMN     "subscription" TEXT NOT NULL DEFAULT 'free';
