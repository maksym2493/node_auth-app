/*
  Warnings:

  - You are about to drop the column `activationToken` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "activationToken",
ADD COLUMN     "activation_token" TEXT;
