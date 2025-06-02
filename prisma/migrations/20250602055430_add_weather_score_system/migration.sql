-- CreateTable
CREATE TABLE "weather_score" (
    "id_score" TEXT NOT NULL,
    "id_province" TEXT NOT NULL,
    "score" DECIMAL(4,2) NOT NULL,
    "rank" INTEGER,
    "aqi_score" DECIMAL(3,2),
    "pm25_score" DECIMAL(3,2),
    "pm10_score" DECIMAL(3,2),
    "temperature_score" DECIMAL(3,2),
    "humidity_score" DECIMAL(3,2),
    "rain_score" DECIMAL(3,2),
    "uv_score" DECIMAL(3,2),
    "wind_score" DECIMAL(3,2),
    "comfort_score" DECIMAL(3,2),
    "weather_data_id" TEXT,
    "aqi_data_id" TEXT,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_score_pkey" PRIMARY KEY ("id_score")
);

-- AddForeignKey
ALTER TABLE "weather_score" ADD CONSTRAINT "weather_score_id_province_fkey" FOREIGN KEY ("id_province") REFERENCES "ms_province"("id_province") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_score" ADD CONSTRAINT "weather_score_weather_data_id_fkey" FOREIGN KEY ("weather_data_id") REFERENCES "weather_data"("id_weather") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_score" ADD CONSTRAINT "weather_score_aqi_data_id_fkey" FOREIGN KEY ("aqi_data_id") REFERENCES "aqi_data"("id_aqi") ON DELETE SET NULL ON UPDATE CASCADE;
