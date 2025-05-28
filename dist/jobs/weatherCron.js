"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWeatherCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const weatherService_1 = require("../services/weatherService");
const weatherService = new weatherService_1.WeatherService();
// รันทุก 30 นาที
const startWeatherCron = () => {
    node_cron_1.default.schedule('*/30 * * * *', async () => {
        console.log('⏰ Running weather data fetch cron job...');
        try {
            await weatherService.fetchAndStoreWeatherData();
            console.log('✅ Weather data fetch completed');
        }
        catch (error) {
            console.error('❌ Weather data fetch failed:', error);
        }
    });
    console.log('🚀 Weather cron job started - runs every 30 minutes');
};
exports.startWeatherCron = startWeatherCron;
