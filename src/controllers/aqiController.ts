import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AqiController {
  // GET /api/aqi - ดึงข้อมูลคุณภาพอากาศทั้งหมด
  getAllAqiData = async (req: Request, res: Response): Promise<void> => {
    try {
      const aqiData = await prisma.aqiData.findMany({
        include: {
          province: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      res.json({
        success: true,
        data: aqiData
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching AQI data',
        error: error.message
      });
    }
  };

  // GET /api/aqi/place/:placeId - ดึงข้อมูลคุณภาพอากาศของสถานที่
  getAqiByPlace = async (req: Request, res: Response): Promise<void> => {
    try {
      const { placeId } = req.params;
      const { limit = 10 } = req.query;
      const place = await prisma.place.findUnique({
        where: {
          id_place: placeId
        },
        select: {
          province_id: true, 
        }
      });
      
      const provinceWithAqi = await prisma.msProvince.findUnique({
        where: {
          id_province: place?.province_id
        },
        select: {
          id_province: true,
          name: true,
          aqi_data: {
            orderBy: {
              created_at: 'desc'
            },
            take: parseInt(limit as string) 
          },
        }
      });
      // province_id
      // const aqiData = await prisma.aqiData.findMany({
      //   where: {
      //     id_province: placeId
      //   },
      //   include: {
      //     province: true
      //   },
      //   orderBy: {
      //     created_at: 'desc'
      //   },
      //   take: parseInt(limit as string)
      // });

      res.json({
        success: true,
        data: provinceWithAqi?.aqi_data || [],
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching AQI data for place',
        error: error.message
      });
    }
  };

  // GET /api/aqi/latest - ดึงข้อมูลคุณภาพอากาศล่าสุดของแต่ละสถานที่
  getLatestAqiData = async (req: Request, res: Response): Promise<void> => {
    try {
      const latestAqiData = await prisma.aqiData.findMany({
        include: {
          province: true,
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      res.json({
        success: true,
        data: latestAqiData
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching latest AQI data',
        error: error.message
      });
    }
  };

  // GET /api/aqi/quality/:level - ดึงข้อมูลตามระดับคุณภาพอากาศ
  getAqiByQualityLevel = async (req: Request, res: Response): Promise<void> => {
    try {
      const { level } = req.params;
      
      let aqiRange: { min: number; max: number };
      
      switch (level.toLowerCase()) {
        case 'good':
          aqiRange = { min: 0, max: 50 };
          break;
        case 'moderate':
          aqiRange = { min: 51, max: 100 };
          break;
        case 'unhealthy-sensitive':
          aqiRange = { min: 101, max: 150 };
          break;
        case 'unhealthy':
          aqiRange = { min: 151, max: 200 };
          break;
        case 'very-unhealthy':
          aqiRange = { min: 201, max: 300 };
          break;
        case 'hazardous':
          aqiRange = { min: 301, max: 500 };
          break;
        default:
          res.status(400).json({
            success: false,
            message: 'Invalid quality level'
          });
          return;
      }

      const aqiData = await prisma.aqiData.findMany({
        where: {
          aqi: {
            gte: aqiRange.min,
            lte: aqiRange.max
          }
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
        data: aqiData,
        level: level,
        range: aqiRange
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching AQI data by quality level',
        error: error.message
      });
    }
  };
}

export const aqiController = new AqiController();