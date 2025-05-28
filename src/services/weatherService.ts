import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface WeatherResponse {
  current: {
    weather_code: number;
    temperature_2m: number;
    rain: number;
    precipitation: number;
    apparent_temperature: number;
  };
  daily: {
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    rain_sum: number[];
    precipitation_probability_max: number[];
    temperature_2m_min: number[];
    temperature_2m_max: number[];
    wind_speed_10m_max: number[];
  };
}

interface AqiResponse {
  data: {
    aqi: number;
    iaqi: {
      pm25?: { v: number };
      pm10?: { v: number };
      no2?: { v: number };
      so2?: { v: number };
      o3?: { v: number };
      co?: { v: number };
    };
  };
}

export class WeatherService {
  async fetchAndStoreWeatherData() {
    try {
      // ดึงข้อมูลสถานที่ทั้งหมดพร้อม province
      const places = await prisma.place.findMany({
        include: {
          province: true
        }
      });

      for (const place of places) {
        // ดึงข้อมูลสภาพอากาศ
        const weatherData = await this.fetchWeatherData(
          Number(place.latitude),
          Number(place.longitude)
        );

        // ดึงข้อมูลคุณภาพอากาศ
        const aqiData = await this.fetchAqiData(
          Number(place.latitude),
          Number(place.longitude)
        );

        // บันทึกข้อมูลสภาพอากาศ
        if (weatherData) {
          await prisma.weatherData.create({
            data: {
              id_place: place.id_place,
              id_province: place.province_id, // เพิ่มฟิลด์นี้
              weather_code: weatherData.current.weather_code,
              temperature_2m: weatherData.current.temperature_2m,
              rain: weatherData.current.rain,
              precipitation: weatherData.current.precipitation,
              apparent_temperature: weatherData.current.apparent_temperature,
              sunrise: weatherData.daily.sunrise[0],
              sunset: weatherData.daily.sunset[0],
              uv_index_max: weatherData.daily.uv_index_max[0],
              rain_sum: weatherData.daily.rain_sum[0],
              precipitation_probability_max: weatherData.daily.precipitation_probability_max[0],
              temperature_2m_min: weatherData.daily.temperature_2m_min[0],
              temperature_2m_max: weatherData.daily.temperature_2m_max[0],
              wind_speed_10m_max: weatherData.daily.wind_speed_10m_max[0],
            },
          });
        }

        // บันทึกข้อมูลคุณภาพอากาศ
        if (aqiData) {
          await prisma.aqiData.create({
            data: {
              id_place: place.id_place,
              aqi: aqiData.data.aqi,
              pm25: aqiData.data.iaqi.pm25?.v || null,
              pm10: aqiData.data.iaqi.pm10?.v || null,
              no2: aqiData.data.iaqi.no2?.v || null,
              so2: aqiData.data.iaqi.so2?.v || null,
              o3: aqiData.data.iaqi.o3?.v || null,
              co: aqiData.data.iaqi.co?.v || null,
            },
          });
        }
      }

      console.log('Weather and AQI data updated successfully');
    } catch (error) {
      console.error('Error updating weather data:', error);
    }
  }

  private async fetchWeatherData(lat: number, lon: number): Promise<WeatherResponse | null> {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m,rain,precipitation,apparent_temperature&daily=sunrise,sunset,uv_index_max,rain_sum,precipitation_probability_max,temperature_2m_min,temperature_2m_max,wind_speed_10m_max`;
      
      const response = await axios.get(url);
      return response.data as WeatherResponse;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  private async fetchAqiData(lat: number, lon: number): Promise<AqiResponse | null> {
    try {
      const aqiToken = process.env.AQICN_API_TOKEN;
      
      if (!aqiToken) {
        console.error('AQICN API token is required');
        return null;
      }
      
      const response = await axios.get(
        `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${aqiToken}`
      );
      return response.data as AqiResponse;
    } catch (error) {
      console.error('Error fetching AQI data:', error);
      return null;
    }
  }
}