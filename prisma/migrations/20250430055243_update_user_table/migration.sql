/*
  Warnings:

  - You are about to drop the column `activation_token` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `reset_token` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "activation_token",
DROP COLUMN "reset_token";
