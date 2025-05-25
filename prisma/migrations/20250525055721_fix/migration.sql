/*
  Warnings:

  - You are about to drop the column `type_role` on the `role` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ADMIN', 'USER', 'MODERATOR');

-- AlterTable
ALTER TABLE "role" DROP COLUMN "type_role",
ADD COLUMN     "role_name" "RoleType" NOT NULL DEFAULT 'USER';
