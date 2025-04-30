/*
  Warnings:

  - Added the required column `token_type` to the `tokens` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('activation', 'refresh', 'resetPassword', 'changeEmail');

-- DropIndex
DROP INDEX "tokens_user_id_key";

-- AlterTable
ALTER TABLE "tokens" ADD COLUMN     "token_type" "TokenType" NOT NULL;
