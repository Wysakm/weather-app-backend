-- CreateTable
CREATE TABLE "weather_data" (
    "id_weather" TEXT NOT NULL,
    "id_place" TEXT NOT NULL,
    "id_province" TEXT,
    "weather_code" INTEGER,
    "temperature_2m" DECIMAL(65,30),
    "rain" DECIMAL(65,30),
    "precipitation" DECIMAL(65,30),
    "apparent_temperature" DECIMAL(65,30),
    "sunrise" TEXT,
    "sunset" TEXT,
    "uv_index_max" DECIMAL(65,30),
    "rain_sum" DECIMAL(65,30),
    "precipitation_probability_max" INTEGER,
    "temperature_2m_min" DECIMAL(65,30),
    "temperature_2m_max" DECIMAL(65,30),
    "wind_speed_10m_max" DECIMAL(65,30),
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_data_pkey" PRIMARY KEY ("id_weather")
);

-- CreateTable
CREATE TABLE "aqi_data" (
    "id_aqi" TEXT NOT NULL,
    "id_place" TEXT NOT NULL,
    "id_province" TEXT,
    "aqi" INTEGER,
    "pm25" DECIMAL(65,30),
    "pm10" DECIMAL(65,30),
    "no2" DECIMAL(65,30),
    "so2" DECIMAL(65,30),
    "o3" DECIMAL(65,30),
    "co" DECIMAL(65,30),
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aqi_data_pkey" PRIMARY KEY ("id_aqi")
);

-- AddForeignKey
ALTER TABLE "weather_data" ADD CONSTRAINT "weather_data_id_place_fkey" FOREIGN KEY ("id_place") REFERENCES "place"("id_place") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_data" ADD CONSTRAINT "weather_data_id_province_fkey" FOREIGN KEY ("id_province") REFERENCES "ms_province"("id_province") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aqi_data" ADD CONSTRAINT "aqi_data_id_place_fkey" FOREIGN KEY ("id_place") REFERENCES "place"("id_place") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aqi_data" ADD CONSTRAINT "aqi_data_id_province_fkey" FOREIGN KEY ("id_province") REFERENCES "ms_province"("id_province") ON DELETE SET NULL ON UPDATE CASCADE;
