"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weatherController = exports.WeatherController = void 0;
const client_1 = require("@prisma/client");
const weatherService_1 = require("../services/weatherService");
const prisma = new client_1.PrismaClient();
class WeatherController {
    constructor() {
        // GET /api/weather - ดึงข้อมูลสภาพอากาศทั้งหมด
        this.getAllWeatherData = async (req, res) => {
            try {
                const weatherData = await prisma.weatherData.findMany({
                    include: {
                        place: {
                            include: {
                                place_type: true,
                                province: true
                            }
                        },
                        province: true
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                });
                res.json({
                    success: true,
                    data: weatherData
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error fetching weather data',
                    error: error.message
                });
            }
        };
        // GET /api/weather/place/:placeId - ดึงข้อมูลสภาพอากาศของสถานที่
        this.getWeatherByPlace = async (req, res) => {
            try {
                const { placeId } = req.params;
                const { limit = 10 } = req.query;
                const weatherData = await prisma.weatherData.findMany({
                    where: {
                        id_place: placeId
                    },
                    include: {
                        place: {
                            include: {
                                place_type: true,
                                province: true
                            }
                        },
                        province: true
                    },
                    orderBy: {
                        created_at: 'desc'
                    },
                    take: parseInt(limit)
                });
                res.json({
                    success: true,
                    data: weatherData
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error fetching weather data for place',
                    error: error.message
                });
            }
        };
        // GET /api/weather/province/:provinceId - ดึงข้อมูลสภาพอากาศของจังหวัด
        this.getWeatherByProvince = async (req, res) => {
            try {
                const { provinceId } = req.params;
                const weatherData = await prisma.weatherData.findMany({
                    where: {
                        id_province: provinceId,
                        id_place: null // เฉพาะข้อมูล province
                    },
                    include: {
                        province: true
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                });
                res.json({
                    success: true,
                    data: weatherData
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error fetching weather data for province',
                    error: error.message
                });
            }
        };
        // GET /api/weather/latest - ดึงข้อมูลสภาพอากาศล่าสุดของแต่ละจังหวัด
        this.getLatestWeatherData = async (req, res) => {
            try {
                const latestWeatherData = await prisma.weatherData.findMany({
                    distinct: ['id_province'],
                    where: {
                        id_place: null // เฉพาะข้อมูล province
                    },
                    include: {
                        province: true
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                });
                res.json({
                    success: true,
                    data: latestWeatherData
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error fetching latest weather data',
                    error: error.message
                });
            }
        };
        // POST /api/weather/fetch - ดึงข้อมูลสภาพอากาศและเก็บลง database
        this.fetchAndStoreWeatherData = async (req, res) => {
            try {
                const { clear = false } = req.query;
                const weatherService = new weatherService_1.WeatherService();
                await weatherService.fetchAndStoreWeatherData(clear === 'true');
                res.json({
                    success: true,
                    message: 'Weather and AQI data fetched and stored successfully'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error fetching and storing weather data',
                    error: error.message
                });
            }
        };
        // POST /api/weather/fetch/province/:provinceId - ดึงข้อมูลสภาพอากาศของจังหวัดเฉพาะ
        this.fetchWeatherForProvince = async (req, res) => {
            try {
                const { provinceId } = req.params;
                const weatherService = new weatherService_1.WeatherService();
                const result = await weatherService.fetchWeatherForProvince(provinceId);
                res.json({
                    success: true,
                    data: result,
                    message: `Weather data fetched for ${result.province}`
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error fetching weather data for province',
                    error: error.message
                });
            }
        };
        // POST /api/weather/clear - ล้างข้อมูลสภาพอากาศเก่า
        this.clearWeatherData = async (req, res) => {
            try {
                const weatherService = new weatherService_1.WeatherService();
                const result = await weatherService.clearOldWeatherData();
                res.json({
                    success: true,
                    message: 'Old weather data cleared successfully',
                    data: result
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error clearing weather data',
                    error: error.message
                });
            }
        };
        // POST /api/weather/refresh - ล้างข้อมูลเก่าแล้วดึงใหม่
        this.refreshWeatherData = async (req, res) => {
            try {
                const weatherService = new weatherService_1.WeatherService();
                // ล้างข้อมูลเก่าแล้วดึงใหม่ในคำสั่งเดียว
                await weatherService.fetchAndStoreWeatherData(true);
                res.json({
                    success: true,
                    message: 'Weather data refreshed successfully with correct timezone'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error refreshing weather data',
                    error: error.message
                });
            }
        };
        // POST /api/weather/auto/start - เริ่ม auto fetch
        this.startAutoFetch = async (req, res) => {
            try {
                const weatherService = new weatherService_1.WeatherService();
                weatherService.startAutoFetch();
                res.json({
                    success: true,
                    message: 'Automatic weather fetching started (every 30 minutes)'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error starting auto fetch',
                    error: error.message
                });
            }
        };
        // POST /api/weather/auto/stop - หยุด auto fetch
        this.stopAutoFetch = async (req, res) => {
            try {
                const weatherService = new weatherService_1.WeatherService();
                weatherService.stopAutoFetch();
                res.json({
                    success: true,
                    message: 'Automatic weather fetching stopped'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error stopping auto fetch',
                    error: error.message
                });
            }
        };
        // GET /api/weather/health - ตรวจสอบสถานะของระบบ
        this.getSystemHealth = async (req, res) => {
            try {
                const weatherService = new weatherService_1.WeatherService();
                const health = await weatherService.getSystemHealth();
                const statusCode = health.status === 'healthy' ? 200 :
                    health.status === 'degraded' ? 207 : 503;
                res.status(statusCode).json({
                    success: true,
                    data: health
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error checking system health',
                    error: error.message
                });
            }
        };
        // GET /api/weather/statistics - ดึงสถิติการใช้งานระบบ
        this.getSystemStatistics = async (req, res) => {
            try {
                const weatherService = new weatherService_1.WeatherService();
                const statistics = await weatherService.getSystemStatistics();
                res.json({
                    success: true,
                    data: statistics
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error fetching system statistics',
                    error: error.message
                });
            }
        };
        // POST /api/weather/update-batch - อัพเดทข้อมูลแบบ batch พร้อมสถิติ
        this.updateWeatherDataBatch = async (req, res) => {
            try {
                const { clearOldData = false } = req.body;
                const weatherService = new weatherService_1.WeatherService();
                // ใช้ฟังก์ชันใหม่ที่ return statistics
                const stats = await weatherService.fetchAndStoreWeatherData(clearOldData);
                res.json({
                    success: true,
                    message: 'Weather data updated successfully',
                    statistics: stats
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error updating weather data',
                    error: error.message
                });
            }
        };
    }
}
exports.WeatherController = WeatherController;
exports.weatherController = new WeatherController();
