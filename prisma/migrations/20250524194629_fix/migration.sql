/*
  Warnings:

  - The primary key for the `ms_province` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `place` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `place_type` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `post` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_oauth` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `updated_at` to the `place` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "place" DROP CONSTRAINT "place_place_type_id_fkey";

-- DropForeignKey
ALTER TABLE "place" DROP CONSTRAINT "place_province_id_fkey";

-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_id_place_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_role_id_fkey";

-- AlterTable
ALTER TABLE "ms_province" DROP CONSTRAINT "ms_province_pkey",
ALTER COLUMN "id_province" DROP DEFAULT,
ALTER COLUMN "id_province" SET DATA TYPE TEXT,
ADD CONSTRAINT "ms_province_pkey" PRIMARY KEY ("id_province");
DROP SEQUENCE "ms_province_id_province_seq";

-- AlterTable
ALTER TABLE "place" DROP CONSTRAINT "place_pkey",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id_place" DROP DEFAULT,
ALTER COLUMN "id_place" SET DATA TYPE TEXT,
ALTER COLUMN "place_type_id" SET DATA TYPE TEXT,
ALTER COLUMN "province_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "place_pkey" PRIMARY KEY ("id_place");
DROP SEQUENCE "place_id_place_seq";

-- AlterTable
ALTER TABLE "place_type" DROP CONSTRAINT "place_type_pkey",
ALTER COLUMN "id_place_type" DROP DEFAULT,
ALTER COLUMN "id_place_type" SET DATA TYPE TEXT,
ADD CONSTRAINT "place_type_pkey" PRIMARY KEY ("id_place_type");
DROP SEQUENCE "place_type_id_place_type_seq";

-- AlterTable
ALTER TABLE "post" DROP CONSTRAINT "post_pkey",
ALTER COLUMN "id_post" DROP DEFAULT,
ALTER COLUMN "id_post" SET DATA TYPE TEXT,
ALTER COLUMN "id_place" SET DATA TYPE TEXT,
ADD CONSTRAINT "post_pkey" PRIMARY KEY ("id_post");
DROP SEQUENCE "post_id_post_seq";

-- AlterTable
ALTER TABLE "role" DROP CONSTRAINT "role_pkey",
ALTER COLUMN "id_role" DROP DEFAULT,
ALTER COLUMN "id_role" SET DATA TYPE TEXT,
ADD CONSTRAINT "role_pkey" PRIMARY KEY ("id_role");
DROP SEQUENCE "role_id_role_seq";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user_oauth" DROP CONSTRAINT "user_oauth_pkey",
ALTER COLUMN "id_oauth" DROP DEFAULT,
ALTER COLUMN "id_oauth" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_oauth_pkey" PRIMARY KEY ("id_oauth");
DROP SEQUENCE "user_oauth_id_oauth_seq";

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_id_place_fkey" FOREIGN KEY ("id_place") REFERENCES "place"("id_place") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place" ADD CONSTRAINT "place_place_type_id_fkey" FOREIGN KEY ("place_type_id") REFERENCES "place_type"("id_place_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place" ADD CONSTRAINT "place_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "ms_province"("id_province") ON DELETE RESTRICT ON UPDATE CASCADE;
