import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { startWeatherCron } from './jobs/weatherCron';
import { WeatherService } from './services/weatherService';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api/places`);
  
  // เริ่ม weather cron job
  startWeatherCron();

  // เริ่ม auto fetch หลังจาก server รัน
  const weatherService = new WeatherService();
  weatherService.startAutoFetch();

  console.log('Server is running with automatic weather fetching every 30 minutes');
});