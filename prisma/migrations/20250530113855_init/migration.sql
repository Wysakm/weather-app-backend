/*
  Warnings:

  - You are about to drop the column `id_place` on the `weather_data` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "aqi_data" DROP CONSTRAINT "aqi_data_id_place_fkey";

-- DropForeignKey
ALTER TABLE "weather_data" DROP CONSTRAINT "weather_data_id_place_fkey";

-- AlterTable
ALTER TABLE "weather_data" DROP COLUMN "id_place";
