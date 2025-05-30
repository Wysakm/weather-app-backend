import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface PlaceQueryParams {
  page?: string;
  limit?: string;
  province_id?: string;
  place_type_id?: string;
  search?: string;
}

interface NearbyQueryParams {
  latitude?: string;
  longitude?: string;
  radius?: string;
}

export class PlaceController {
  // GET /api/places - ดึงข้อมูลสถานที่ทั้งหมด
  getAllPlaces = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = '1', limit = '10', province_id, place_type_id, search }: PlaceQueryParams = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: Prisma.PlaceWhereInput = {};
      
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
                posts: true
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

  // POST /api/places - เพิ่มสถานที่ใหม่
  createPlace = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('=== CREATE PLACE REQUEST ===');
      console.log('Request Body:', req.body);
      
      const { 
        name_place, 
        latitude, 
        longitude, 
        place_type_id,
        province_id,
        district,
        sub_district,
        place_image,
        google_place_id
      } = req.body;
      
      // Validate required fields
      if (!name_place || !latitude || !longitude || !place_type_id) {
        res.status(400).json({
          success: false,
          message: 'name_place, latitude, longitude, and place_type_id are required'
        });
        return;
      }

      // ตรวจสอบการซ้ำกันของชื่อสถานที่
      const existingPlaceByName = await prisma.place.findFirst({
        where: {
          name_place: {
            equals: name_place,
            mode: 'insensitive'
          }
        }
      });

      if (existingPlaceByName) {
        res.status(409).json({
          success: false,
          message: `Place with name '${name_place}' already exists`
        });
        return;
      }

      // Check for duplicate Google Place ID (หากมีการส่ง google_place_id มา)
      if (google_place_id) {
        const existingPlaceByGoogleId = await prisma.place.findFirst({
          where: {
            gg_ref: google_place_id
          }
        });

        if (existingPlaceByGoogleId) {
          res.status(409).json({
            success: false,
            message: `Place with Google Place ID '${google_place_id}' already exists`,
            existingPlace: {
              id: existingPlaceByGoogleId.id_place,
              name: existingPlaceByGoogleId.name_place
            }
          });
          return;
        }
      }

      // Check for duplicate coordinates
      const existingPlaceByCoords = await prisma.place.findFirst({
        where: {
          latitude: parseFloat(latitude.toString()),
          longitude: parseFloat(longitude.toString())
        }
      });

      if (existingPlaceByCoords) {
        res.status(409).json({
          success: false,
          message: `Place with coordinates (${latitude}, ${longitude}) already exists`
        });
        return;
      }

      // Find place type by ID
      const placeType = await prisma.placeType.findUnique({
        where: {
          id_place_type: place_type_id
        }
      });
      
      console.log('Found place type:', placeType);
      
      if (!placeType) {
        console.log('❌ Place type not found');
        res.status(400).json({
          success: false,
          message: `Place type with ID '${place_type_id}' not found`
        });
        return;
      }

      // หาจังหวัด
      let selectedProvinceId: string;
      
      if (province_id) {
        const foundProvince = await prisma.msProvince.findUnique({
          where: { 
            id_province: province_id
          }
        });
        
        if (foundProvince) {
          selectedProvinceId = foundProvince.id_province;
        } else {
          res.status(400).json({
            success: false,
            message: `Province with ID '${province_id}' not found`
          });
          return;
        }
      } else {
        // ใช้จังหวัดเริ่มต้น (Bangkok)
        const defaultProvince = await prisma.msProvince.findFirst({
          where: { name: 'Bangkok' }
        });
        
        if (!defaultProvince) {
          res.status(400).json({
            success: false,
            message: 'No default province found. Please specify province_id'
          });
          return;
        }
        
        selectedProvinceId = defaultProvince.id_province;
      }

      const place = await prisma.place.create({
        data: {
          name_place,
          latitude: parseFloat(latitude.toString()),
          longitude: parseFloat(longitude.toString()),
          place_type_id: place_type_id,
          province_id: selectedProvinceId,
          district: district || null,
          sub_district: sub_district || null,
          place_image: place_image || null,
          gg_ref: google_place_id || null
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
      console.error('❌ Error creating place:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating place',
        error: error.message
      });
    }
  };

  // POST /api/places/google - เพิ่มสถานที่จาก Google Places API
  createPlaceFromGoogle = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        google_place_id,
        google_place_data,
        place_type_id = 'default_tourist_attraction_id', // ใส่ ID ของ Tourist Attraction
        province_id
      } = req.body;

      // Validate required fields
      if (!google_place_id || !google_place_data) {
        res.status(400).json({
          success: false,
          message: 'google_place_id and google_place_data are required'
        });
        return;
      }

      // Check if place already exists by Google Place ID
      const existingPlace = await prisma.place.findFirst({
        where: {
          gg_ref: google_place_id
        }
      });

      if (existingPlace) {
        res.status(409).json({
          success: false,
          message: `Place with Google Place ID '${google_place_id}' already exists`,
          existingPlace: {
            id: existingPlace.id_place,
            name: existingPlace.name_place,
            google_place_id: existingPlace.gg_ref
          }
        });
        return;
      }

      // Extract data from Google Places response
      const {
        name,
        geometry: { location: { lat, lng } },
        formatted_address,
        types,
        photos,
        vicinity
      } = google_place_data;

      // Check for duplicate name
      const existingPlaceByName = await prisma.place.findFirst({
        where: {
          name_place: {
            equals: name,
            mode: 'insensitive'
          }
        }
      });

      if (existingPlaceByName) {
        res.status(409).json({
          success: false,
          message: `Place with name '${name}' already exists`,
          existingPlace: {
            id: existingPlaceByName.id_place,
            name: existingPlaceByName.name_place
          }
        });
        return;
      }

      // Check for duplicate coordinates
      const existingPlaceByCoords = await prisma.place.findFirst({
        where: {
          latitude: lat,
          longitude: lng
        }
      });

      if (existingPlaceByCoords) {
        res.status(409).json({
          success: false,
          message: `Place with coordinates (${lat}, ${lng}) already exists`,
          existingPlace: {
            id: existingPlaceByCoords.id_place,
            name: existingPlaceByCoords.name_place
          }
        });
        return;
      }

      // Find place type by ID
      const placeType = await prisma.placeType.findUnique({
        where: {
          id_place_type: place_type_id
        }
      });

      if (!placeType) {
        res.status(400).json({
          success: false,
          message: `Place type with ID '${place_type_id}' not found`
        });
        return;
      }

      // Determine province
      let selectedProvinceId: string = '';
      
      if (province_id) {
        // ใช้ province_id ที่ส่งมา
        const foundProvince = await prisma.msProvince.findUnique({
          where: { id_province: province_id }
        });

        if (foundProvince) {
          selectedProvinceId = foundProvince.id_province;
        } else {
          res.status(400).json({
            success: false,
            message: `Province with ID '${province_id}' not found`
          });
          return;
        }
      } else {
        // Try to extract province from formatted_address
        const addressParts = formatted_address?.split(',') || [];
        let provinceFound = false;

        for (const part of addressParts) {
          const trimmedPart = part.trim();
          const foundProvince = await prisma.msProvince.findFirst({
            where: {
              name: {
                contains: trimmedPart,
                mode: 'insensitive'
              }
            }
          });

          if (foundProvince) {
            selectedProvinceId = foundProvince.id_province;
            provinceFound = true;
            break;
          }
        }

        if (!provinceFound) {
          // Use Bangkok as default
          const defaultProvince = await prisma.msProvince.findFirst({
            where: { name: 'Bangkok' }
          });

          if (!defaultProvince) {
            res.status(400).json({
              success: false,
              message: 'No default province found'
            });
            return;
          }

          selectedProvinceId = defaultProvince.id_province;
        }
      }

      // Get photo URL if available
      let placeImage = null;
      if (photos && photos.length > 0) {
        // Store the photo reference for now
        placeImage = photos[0].photo_reference;
      }

      const place = await prisma.place.create({
        data: {
          name_place: name,
          latitude: lat,
          longitude: lng,
          place_type_id: place_type_id,
          province_id: selectedProvinceId,
          district: vicinity || null,
          sub_district: null,
          place_image: placeImage,
          gg_ref: google_place_id
        },
        include: {
          place_type: true,
          province: true
        }
      });

      res.status(201).json({
        success: true,
        data: place,
        message: 'Place created from Google Places API successfully'
      });
    } catch (error: any) {
      console.error('Error creating place from Google:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating place from Google Places API',
        error: error.message
      });
    }
  };

  // GET /api/places/check-google/:google_place_id - ตรวจสอบว่าสถานที่จาก Google มีอยู่แล้วหรือไม่
  checkGooglePlace = async (req: Request, res: Response): Promise<void> => {
    try {
      const { google_place_id } = req.params;
      console.log(' google_place_id:', google_place_id)

      const existingPlace = await prisma.place.findFirst({
        where: {
          gg_ref: google_place_id
        },
        include: {
          place_type: true,
          province: true
        }
      });
      console.log(' existingPlace:', existingPlace)

      if (existingPlace) {
        res.json({
          success: true,
          exists: true,
          data: existingPlace,
          message: 'Place already exists in database'
        });
      } else {
        res.json({
          success: true,
          exists: false,
          message: 'Place does not exist in database'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error checking Google place',
        error: error.message
      });
    }
  };

  // DELETE /api/places/:id - ลบสถานที่
  deletePlace = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { force } = req.query; // เพิ่ม query parameter สำหรับ force delete

      // ตรวจสอบว่าสถานที่มีอยู่จริง
      const existingPlace = await prisma.place.findUnique({
        where: { id_place: id },
        include: {
          _count: {
            select: {
              posts: true
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
      const hasRelatedData = existingPlace._count.posts > 0;

      // หากมีข้อมูลที่เกี่ยวข้องและไม่มี force parameter
      if (hasRelatedData && force !== 'true') {
        res.status(400).json({
          success: false,
          message: 'Cannot delete place with related data (posts). Use ?force=true to force delete.',
          relatedData: {
            posts: existingPlace._count.posts
          }
        });
        return;
      }

      // หากเป็น force delete ให้ลบข้อมูลที่เกี่ยวข้องก่อน
      if (force === 'true' && hasRelatedData) {
        await prisma.$transaction(async (tx) => {
          // ลบ posts ที่เกี่ยวข้อง
          await tx.post.deleteMany({
            where: { id_place: id }
          });

          // ลบ place
          await tx.place.delete({
            where: { id_place: id }
          });
        });

        res.json({
          success: true,
          message: 'Place and all related data deleted successfully (force delete)',
          deletedData: {
            posts: existingPlace._count.posts
          }
        });
      } else {
        // ลบ place ปกติ (ไม่มีข้อมูลที่เกี่ยวข้อง)
        await prisma.place.delete({
          where: { id_place: id }
        });

        res.json({
          success: true,
          message: 'Place deleted successfully'
        });
      }
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
      const { latitude, longitude, radius = '10' }: NearbyQueryParams = req.query;

      if (!latitude || !longitude) {
        res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
        return;
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusKm = parseFloat(radius);

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

  // PUT /api/places/:id - อัปเดตข้อมูลสถานที่
  updatePlace = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        name_place,
        latitude,
        longitude,
        place_type_id,
        province_id,
        district,
        sub_district,
        place_image,
        google_place_id,
        google_place_data
      } = req.body;

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

      // ตรวจสอบการซ้ำกันของชื่อสถานที่ (ยกเว้นสถานที่ปัจจุบัน)
      if (name_place && name_place !== existingPlace.name_place) {
        const duplicateName = await prisma.place.findFirst({
          where: {
            name_place: {
              equals: name_place,
              mode: 'insensitive'
            },
            id_place: {
              not: id
            }
          }
        });

        if (duplicateName) {
          res.status(409).json({
            success: false,
            message: `Place with name '${name_place}' already exists`
          });
          return;
        }
      }

      // ตรวจสอบการซ้ำกันของพิกัด (ยกเว้นสถานที่ปัจจุบัน)
      if (latitude && longitude) {
        const duplicateCoords = await prisma.place.findFirst({
          where: {
            latitude: parseFloat(latitude.toString()),
            longitude: parseFloat(longitude.toString()),
            id_place: {
              not: id
            }
          }
        });

        if (duplicateCoords) {
          res.status(409).json({
            success: false,
            message: `Place with coordinates (${latitude}, ${longitude}) already exists`
          });
          return;
        }
      }

      // ตรวจสอบการซ้ำกันของ Google Place ID (ยกเว้นสถานที่ปัจจุบัน)
      if (google_place_id && google_place_id !== existingPlace.gg_ref) {
        const duplicateGoogleId = await prisma.place.findFirst({
          where: {
            gg_ref: google_place_id,
            id_place: {
              not: id
            }
          }
        });

        if (duplicateGoogleId) {
          res.status(409).json({
            success: false,
            message: `Place with Google Place ID '${google_place_id}' already exists`
          });
          return;
        }
      }

      // หา place_type ถ้ามีการส่ง place_type_id มา
      let placeTypeId = existingPlace.place_type_id;
      if (place_type_id) {
        const placeType = await prisma.placeType.findUnique({
          where: {
            id_place_type: place_type_id
          }
        });

        if (!placeType) {
          res.status(400).json({
            success: false,
            message: `Place type with ID '${place_type_id}' not found`
          });
          return;
        }

        placeTypeId = place_type_id;
      }

      // หาจังหวัด ถ้ามีการส่ง province_id มา
      let provinceId = existingPlace.province_id;
      if (province_id) {
        const province = await prisma.msProvince.findUnique({
          where: {
            id_province: province_id
          }
        });

        if (!province) {
          res.status(400).json({
            success: false,
            message: `Province with ID '${province_id}' not found`
          });
          return;
        }

        provinceId = province.id_province;
      }

      // อัปเดตข้อมูล
      const updatedPlace = await prisma.place.update({
        where: { id_place: id },
        data: {
          ...(name_place && { name_place }),
          ...(latitude && { latitude: parseFloat(latitude.toString()) }),
          ...(longitude && { longitude: parseFloat(longitude.toString()) }),
          place_type_id: placeTypeId,
          province_id: provinceId,
          ...(district !== undefined && { district: district || null }),
          ...(sub_district !== undefined && { sub_district: sub_district || null }),
          ...(place_image !== undefined && { place_image: place_image || null }),
          ...(google_place_id !== undefined && { gg_ref: google_place_id || null }),
          updated_at: new Date()
        },
        include: {
          place_type: true,
          province: true
        }
      });

      res.json({
        success: true,
        data: updatedPlace,
        message: 'Place updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating place:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating place',
        error: error.message
      });
    }
  };

  // เพิ่ม method สำหรับค้นหา Google Place ID จากพิกัด
  findGooglePlaceId = async (lat: number, lng: number): Promise<string | null> => {
    try {
      // เรียก Google Places API Nearby Search หรือ Geocoding API
      // เพื่อค้นหา place_id จากพิกัดที่ให้มา
      
      // ตัวอย่างการใช้ Google Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );
      
      const data: any = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        return data.results[0].place_id;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding Google Place ID:', error);
      return null;
    }
  };
}

// Export instance for use in routes
export const placeController = new PlaceController();