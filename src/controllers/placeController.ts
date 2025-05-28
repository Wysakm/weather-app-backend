import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PlaceController {
  // GET /api/places - ดึงข้อมูลสถานที่ทั้งหมด
  getAllPlaces = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, province_id, place_type_id, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      
      if (province_id) where.province_id = province_id as string;
      if (place_type_id) where.place_type_id = place_type_id as string;
      if (search) {
        where.name_place = {
          contains: search as string,
          mode: 'insensitive'
        };
      }

      const [places, total] = await Promise.all([
        prisma.place.findMany({
          where,
          include: {
            place_type: true,
            province: true,
            _count: {
              select: {
                posts: true,
                weather_data: true,
                aqi_data: true
              }
            }
          },
          skip,
          take: Number(limit),
          orderBy: { created_at: 'desc' }
        }),
        prisma.place.count({ where })
      ]);

      res.json({
        success: true,
        data: places,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching places',
        error: error.message
      });
    }
  };

  // GET /api/places/:id - ดึงข้อมูลสถานที่ตาม ID
  getPlaceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const place = await prisma.place.findUnique({
        where: { id_place: id },
        include: {
          place_type: true,
          province: true,
          posts: {
            include: {
              user: {
                select: {
                  id_user: true,
                  username: true,
                  display_name: true
                }
              }
            },
            orderBy: { created_at: 'desc' }
          },
          weather_data: {
            orderBy: { recorded_at: 'desc' },
            take: 1
          },
          aqi_data: {
            orderBy: { recorded_at: 'desc' },
            take: 1
          }
        }
      });

      if (!place) {
        res.status(404).json({
          success: false,
          message: 'Place not found'
        });
        return;
      }

      res.json({
        success: true,
        data: place
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching place',
        error: error.message
      });
    }
  };

  // POST /api/places - สร้างสถานที่ใหม่
  createPlace = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        gg_ref,
        name_place,
        place_type_id,
        latitude,
        longitude,
        province_id,
        district,
        sub_district,
        place_image
      } = req.body;

      // ตรวจสอบว่า place_type และ province มีอยู่จริง
      const [placeType, province] = await Promise.all([
        prisma.placeType.findUnique({ where: { id_place_type: place_type_id } }),
        prisma.msProvince.findUnique({ where: { id_province: province_id } })
      ]);

      if (!placeType) {
        res.status(400).json({
          success: false,
          message: 'Invalid place type'
        });
        return;
      }

      if (!province) {
        res.status(400).json({
          success: false,
          message: 'Invalid province'
        });
        return;
      }

      const place = await prisma.place.create({
        data: {
          gg_ref,
          name_place,
          place_type_id,
          latitude,
          longitude,
          province_id,
          district,
          sub_district,
          place_image
        },
        include: {
          place_type: true,
          province: true
        }
      });

      res.status(201).json({
        success: true,
        data: place,
        message: 'Place created successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error creating place',
        error: error.message
      });
    }
  };

  // PUT /api/places/:id - อัปเดตข้อมูลสถานที่
  updatePlace = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // ตรวจสอบว่าสถานที่มีอยู่จริง
      const existingPlace = await prisma.place.findUnique({
        where: { id_place: id }
      });

      if (!existingPlace) {
        res.status(404).json({
          success: false,
          message: 'Place not found'
        });
        return;
      }

      // ตรวจสอบ place_type และ province หากมีการอัปเดต
      if (updateData.place_type_id) {
        const placeType = await prisma.placeType.findUnique({
          where: { id_place_type: updateData.place_type_id }
        });
        if (!placeType) {
          res.status(400).json({
            success: false,
            message: 'Invalid place type'
          });
          return;
        }
      }

      if (updateData.province_id) {
        const province = await prisma.msProvince.findUnique({
          where: { id_province: updateData.province_id }
        });
        if (!province) {
          res.status(400).json({
            success: false,
            message: 'Invalid province'
          });
          return;
        }
      }

      const place = await prisma.place.update({
        where: { id_place: id },
        data: updateData,
        include: {
          place_type: true,
          province: true
        }
      });

      res.json({
        success: true,
        data: place,
        message: 'Place updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error updating place',
        error: error.message
      });
    }
  };

  // DELETE /api/places/:id - ลบสถานที่
  deletePlace = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // ตรวจสอบว่าสถานที่มีอยู่จริง
      const existingPlace = await prisma.place.findUnique({
        where: { id_place: id },
        include: {
          _count: {
            select: {
              posts: true,
              weather_data: true,
              aqi_data: true
            }
          }
        }
      });

      if (!existingPlace) {
        res.status(404).json({
          success: false,
          message: 'Place not found'
        });
        return;
      }

      // ตรวจสอบว่ามีข้อมูลที่เกี่ยวข้องหรือไม่
      const hasRelatedData = existingPlace._count.posts > 0 || 
                           existingPlace._count.weather_data > 0 || 
                           existingPlace._count.aqi_data > 0;

      if (hasRelatedData) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete place with related data (posts, weather data, or AQI data)'
        });
        return;
      }

      await prisma.place.delete({
        where: { id_place: id }
      });

      res.json({
        success: true,
        message: 'Place deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error deleting place',
        error: error.message
      });
    }
  };

  // GET /api/places/nearby - ค้นหาสถานที่ใกล้เคียง
  getNearbyPlaces = async (req: Request, res: Response): Promise<void> => {
    try {
      const { latitude, longitude, radius = 10 } = req.query;

      if (!latitude || !longitude) {
        res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
        return;
      }

      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radiusKm = parseFloat(radius as string);

      // ใช้ raw query สำหรับการคำนวณระยะทาง
      const places = await prisma.$queryRaw`
        SELECT p.*, pt.type_name, pr.name as province_name,
               (6371 * acos(cos(radians(${lat})) * cos(radians(CAST(p.latitude AS FLOAT))) * 
               cos(radians(CAST(p.longitude AS FLOAT)) - radians(${lng})) + 
               sin(radians(${lat})) * sin(radians(CAST(p.latitude AS FLOAT))))) AS distance
        FROM place p
        LEFT JOIN place_type pt ON p.place_type_id = pt.id_place_type
        LEFT JOIN ms_province pr ON p.province_id = pr.id_province
        HAVING distance <= ${radiusKm}
        ORDER BY distance
      `;

      res.json({
        success: true,
        data: places
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching nearby places',
        error: error.message
      });
    }
  };
}