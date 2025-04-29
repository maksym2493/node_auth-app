/*
  Warnings:

  - The primary key for the `tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `refreshToken` on the `tokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_pkey",
DROP COLUMN "refreshToken",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "tokens_pkey" PRIMARY KEY ("id");
