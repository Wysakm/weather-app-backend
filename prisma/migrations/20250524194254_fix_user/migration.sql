/*
  Warnings:

  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_approved_by_fkey";

-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_id_user_fkey";

-- DropForeignKey
ALTER TABLE "user_oauth" DROP CONSTRAINT "user_oauth_user_id_fkey";

-- AlterTable
ALTER TABLE "post" ALTER COLUMN "id_user" SET DATA TYPE TEXT,
ALTER COLUMN "approved_by" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
ALTER COLUMN "id_user" DROP DEFAULT,
ALTER COLUMN "id_user" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id_user");
DROP SEQUENCE "user_id_user_seq";

-- AlterTable
ALTER TABLE "user_oauth" ALTER COLUMN "user_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "user"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_oauth" ADD CONSTRAINT "user_oauth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
