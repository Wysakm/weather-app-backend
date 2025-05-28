"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWeatherScheduler = startWeatherScheduler;
exports.stopWeatherScheduler = stopWeatherScheduler;
exports.getSchedulerStatus = getSchedulerStatus;
const weatherService_1 = require("../services/weatherService");
const weatherService = new weatherService_1.WeatherService();
/**
 * เริ่ม Weather Scheduler ที่ปรับปรุงใหม่
 * ใช้ built-in auto-fetch ของ WeatherService ที่มีการ optimize แล้ว
 */
function startWeatherScheduler() {
    console.log('🚀 Starting optimized weather scheduler...');
    // ใช้ built-in auto-fetch ที่มี retry logic และ batch processing
    weatherService.startAutoFetch();
    console.log('✅ Weather scheduler started with optimized auto-fetch (every 30 minutes)');
    console.log('💡 Features enabled: batch processing, retry logic, health monitoring');
}
/**
 * หยุด Weather Scheduler
 */
function stopWeatherScheduler() {
    console.log('🛑 Stopping weather scheduler...');
    weatherService.stopAutoFetch();
    console.log('✅ Weather scheduler stopped');
}
/**
 * ดึงสถานะของ Weather Scheduler
 */
async function getSchedulerStatus() {
    const [health, stats] = await Promise.all([
        weatherService.getSystemHealth(),
        weatherService.getSystemStatistics()
    ]);
    return {
        health,
        statistics: stats,
        timestamp: new Date().toISOString()
    };
}
