import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { startWeatherScheduler } from './scheduler/weatherScheduler';

const PORT = process.env.PORT || 3000;

// เริ่ม scheduler
startWeatherScheduler();

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api-docs`);
});