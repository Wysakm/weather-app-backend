import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { startWeatherScheduler } from './scheduler/weatherScheduler';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api/places`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/weather/health`);
  console.log(`📈 Statistics: http://localhost:${PORT}/api/weather/statistics`);
  
  // เริ่ม optimized weather scheduler (ใช้ตัวเดียวแทนของเดิม 3 ตัว)
  // startWeatherScheduler();
  console.log('✅ Server is running with optimized automatic weather fetching');
});