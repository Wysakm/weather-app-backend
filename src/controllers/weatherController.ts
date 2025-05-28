import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { WeatherService } from '../services/weatherService';

const prisma = new PrismaClient();

export class WeatherController {
  // GET /api/weather - ดึงข้อมูลสภาพอากาศทั้งหมด
  getAllWeatherData = async (req: Request, res: Response): Promise<void> => {
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching weather data',
        error: error.message
      });
    }
  };

  // GET /api/weather/place/:placeId - ดึงข้อมูลสภาพอากาศของสถานที่
  getWeatherByPlace = async (req: Request, res: Response): Promise<void> => {
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
        take: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: weatherData
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching weather data for place',
        error: error.message
      });
    }
  };

  // GET /api/weather/province/:provinceId - ดึงข้อมูลสภาพอากาศของจังหวัด
  getWeatherByProvince = async (req: Request, res: Response): Promise<void> => {
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching weather data for province',
        error: error.message
      });
    }
  };

  // GET /api/weather/latest - ดึงข้อมูลสภาพอากาศล่าสุดของแต่ละจังหวัด
  getLatestWeatherData = async (req: Request, res: Response): Promise<void> => {
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching latest weather data',
        error: error.message
      });
    }
  };

  // POST /api/weather/fetch - ดึงข้อมูลสภาพอากาศและเก็บลง database
  fetchAndStoreWeatherData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clear = false } = req.query;
      const weatherService = new WeatherService();
      
      await weatherService.fetchAndStoreWeatherData(clear === 'true');

      res.json({
        success: true,
        message: 'Weather and AQI data fetched and stored successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching and storing weather data',
        error: error.message
      });
    }
  };

  // POST /api/weather/fetch/province/:provinceId - ดึงข้อมูลสภาพอากาศของจังหวัดเฉพาะ
  fetchWeatherForProvince = async (req: Request, res: Response): Promise<void> => {
    try {
      const { provinceId } = req.params;
      const weatherService = new WeatherService();
      
      const result = await weatherService.fetchWeatherForProvince(provinceId);

      res.json({
        success: true,
        data: result,
        message: `Weather data fetched for ${result.province}`
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching weather data for province',
        error: error.message
      });
    }
  };

  // POST /api/weather/clear - ล้างข้อมูลสภาพอากาศเก่า
  clearWeatherData = async (req: Request, res: Response): Promise<void> => {
    try {
      const weatherService = new WeatherService();
      const result = await weatherService.clearOldWeatherData();

      res.json({
        success: true,
        message: 'Old weather data cleared successfully',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error clearing weather data',
        error: error.message
      });
    }
  };

  // POST /api/weather/refresh - ล้างข้อมูลเก่าแล้วดึงใหม่
  refreshWeatherData = async (req: Request, res: Response): Promise<void> => {
    try {
      const weatherService = new WeatherService();
      
      // ล้างข้อมูลเก่าแล้วดึงใหม่ในคำสั่งเดียว
      await weatherService.fetchAndStoreWeatherData(true);

      res.json({
        success: true,
        message: 'Weather data refreshed successfully with correct timezone'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error refreshing weather data',
        error: error.message
      });
    }
  };

  // POST /api/weather/auto/start - เริ่ม auto fetch
  startAutoFetch = async (req: Request, res: Response): Promise<void> => {
    try {
      const weatherService = new WeatherService();
      weatherService.startAutoFetch();

      res.json({
        success: true,
        message: 'Automatic weather fetching started (every 30 minutes)'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error starting auto fetch',
        error: error.message
      });
    }
  };

  // POST /api/weather/auto/stop - หยุด auto fetch
  stopAutoFetch = async (req: Request, res: Response): Promise<void> => {
    try {
      const weatherService = new WeatherService();
      weatherService.stopAutoFetch();

      res.json({
        success: true,
        message: 'Automatic weather fetching stopped'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error stopping auto fetch',
        error: error.message
      });
    }
  };

  // GET /api/weather/health - ตรวจสอบสถานะของระบบ
  getSystemHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const weatherService = new WeatherService();
      const health = await weatherService.getSystemHealth();

      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 207 : 503;

      res.status(statusCode).json({
        success: true,
        data: health
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error checking system health',
        error: error.message
      });
    }
  };

  // GET /api/weather/statistics - ดึงสถิติการใช้งานระบบ
  getSystemStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const weatherService = new WeatherService();
      const statistics = await weatherService.getSystemStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching system statistics',
        error: error.message
      });
    }
  };

  // POST /api/weather/update-batch - อัพเดทข้อมูลแบบ batch พร้อมสถิติ
  updateWeatherDataBatch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clearOldData = false } = req.body;
      const weatherService = new WeatherService();
      
      // ใช้ฟังก์ชันใหม่ที่ return statistics
      const stats = await weatherService.fetchAndStoreWeatherData(clearOldData);

      res.json({
        success: true,
        message: 'Weather data updated successfully',
        statistics: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error updating weather data',
        error: error.message
      });
    }
  };
}

export const weatherController = new WeatherController();