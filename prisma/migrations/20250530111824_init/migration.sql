/*
  Warnings:

  - The `sunrise` column on the `weather_data` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `sunset` column on the `weather_data` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "aqi_data" DROP CONSTRAINT "aqi_data_id_place_fkey";

-- DropForeignKey
ALTER TABLE "weather_data" DROP CONSTRAINT "weather_data_id_place_fkey";

-- AlterTable
ALTER TABLE "aqi_data" ALTER COLUMN "id_place" DROP NOT NULL;

-- AlterTable
ALTER TABLE "weather_data" ALTER COLUMN "id_place" DROP NOT NULL,
DROP COLUMN "sunrise",
ADD COLUMN     "sunrise" TIMESTAMP(3),
DROP COLUMN "sunset",
ADD COLUMN     "sunset" TIMESTAMP(3),
ALTER COLUMN "precipitation_probability_max" SET DATA TYPE DECIMAL(65,30);

-- AddForeignKey
ALTER TABLE "weather_data" ADD CONSTRAINT "weather_data_id_place_fkey" FOREIGN KEY ("id_place") REFERENCES "place"("id_place") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aqi_data" ADD CONSTRAINT "aqi_data_id_place_fkey" FOREIGN KEY ("id_place") REFERENCES "place"("id_place") ON DELETE SET NULL ON UPDATE CASCADE;
