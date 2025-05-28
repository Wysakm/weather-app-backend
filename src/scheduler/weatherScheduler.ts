import { WeatherService } from '../services/weatherService';

const weatherService = new WeatherService();

// ฟังก์ชันสำหรับรัน scheduler
export function startWeatherScheduler() {
  // รันทันทีเมื่อเริ่มต้น
  weatherService.fetchAndStoreWeatherData();

  // รันทุก 1 ชั่วโมง (3600000 milliseconds)
  setInterval(() => {
    weatherService.fetchAndStoreWeatherData();
  }, 3600000);

  console.log('Weather scheduler started - running every hour');
}