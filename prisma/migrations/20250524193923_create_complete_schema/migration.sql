/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id_user" SERIAL NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "phonenumber" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "role" (
    "id_role" SERIAL NOT NULL,
    "type_role" TEXT NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "post" (
    "id_post" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_place" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "display" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id_post")
);

-- CreateTable
CREATE TABLE "place" (
    "id_place" SERIAL NOT NULL,
    "gg_ref" TEXT,
    "name_place" TEXT NOT NULL,
    "place_type_id" INTEGER NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "province_id" INTEGER NOT NULL,
    "district" TEXT,
    "sub_district" TEXT,
    "place_image" TEXT,

    CONSTRAINT "place_pkey" PRIMARY KEY ("id_place")
);

-- CreateTable
CREATE TABLE "place_type" (
    "id_place_type" SERIAL NOT NULL,
    "type_name" TEXT NOT NULL,

    CONSTRAINT "place_type_pkey" PRIMARY KEY ("id_place_type")
);

-- CreateTable
CREATE TABLE "ms_province" (
    "id_province" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ms_province_pkey" PRIMARY KEY ("id_province")
);

-- CreateTable
CREATE TABLE "user_oauth" (
    "id_oauth" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_oauth_pkey" PRIMARY KEY ("id_oauth")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_id_place_fkey" FOREIGN KEY ("id_place") REFERENCES "place"("id_place") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "user"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place" ADD CONSTRAINT "place_place_type_id_fkey" FOREIGN KEY ("place_type_id") REFERENCES "place_type"("id_place_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place" ADD CONSTRAINT "place_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "ms_province"("id_province") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_oauth" ADD CONSTRAINT "user_oauth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
