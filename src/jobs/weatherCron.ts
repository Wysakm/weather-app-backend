import cron from 'node-cron';
import { WeatherService } from '../services/weatherService';

const weatherService = new WeatherService();

// รันทุก 30 นาที
export const startWeatherCron = () => {
  cron.schedule('*/30 * * * *', async () => {
    console.log('⏰ Running weather data fetch cron job...');
    try {
      await weatherService.fetchAndStoreWeatherData();
      console.log('✅ Weather data fetch completed');
    } catch (error) {
      console.error('❌ Weather data fetch failed:', error);
    }
  });
  
  console.log('🚀 Weather cron job started - runs every 30 minutes');
};