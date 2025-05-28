"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const weatherCron_1 = require("./jobs/weatherCron");
const weatherService_1 = require("./services/weatherService");
const PORT = process.env.PORT || 3000;
app_1.default.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/api/places`);
    // เริ่ม weather cron job
    (0, weatherCron_1.startWeatherCron)();
    // เริ่ม auto fetch หลังจาก server รัน
    const weatherService = new weatherService_1.WeatherService();
    weatherService.startAutoFetch();
    console.log('Server is running with automatic weather fetching every 30 minutes');
});
