import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SearchFilters {
  weather_code?: number;
  aqi_range?: string;
  temperature_min?: number;
  temperature_max?: number;
  province_id?: string;
  place_type_id?: string;
}

export interface LocationSearchParams {
  query: string;
  province_id?: string;
  place_type_id?: string;
  limit?: number;
}

export interface WeatherSearchParams {
  weather_code?: number;
  aqi_range?: string;
  limit?: number;
}

export class SearchController {
  /**
   * GET /api/search/locations - ค้นหาสถานที่ตามชื่อ จังหวัด และประเภท
   */
  searchLocations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        query, 
        province_id, 
        place_type_id, 
        limit = '20' 
      } = req.query as { 
        query?: string;
        province_id?: string;
        place_type_id?: string;
        limit?: string;
      };

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
        return;
      }

      const limitNum = parseInt(limit);
      const searchTerm = query.trim();

      // Build search conditions
      const where: any = {
        OR: [
          { name_place: { contains: searchTerm, mode: 'insensitive' } },
          { district: { contains: searchTerm, mode: 'insensitive' } },
          { province: { name: { contains: searchTerm, mode: 'insensitive' } } }
        ]
      };

      // Add additional filters
      if (province_id) {
        where.province_id = province_id;
      }

      if (place_type_id) {
        where.place_type_id = place_type_id;
      }

      // Search places
      const places = await prisma.place.findMany({
        where,
        include: {
          place_type: true,
          province: true,
          posts: {
            where: { status: 'approved' },
            select: {
              id_post: true,
              title: true,
              image: true
            },
            take: 3
          },
          _count: {
            select: {
              posts: {
                where: { status: 'approved' }
              }
            }
          }
        },
        take: limitNum,
        orderBy: [
          { name_place: 'asc' }
        ]
      });

      res.json({
        success: true,
        message: `Found ${places.length} places matching "${searchTerm}"`,
        data: {
          places,
          total: places.length,
          query: searchTerm
        }
      });

    } catch (error: any) {
      console.error('Error searching locations:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching locations',
        error: error.message
      });
    }
  };

  /**
   * GET /api/search/weather - ค้นหาจังหวัดตามเงื่อนไขสภาพอากาศ
   */
  searchByWeather = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        weather_code, 
        aqi_range,
        limit = '20' 
      } = req.query as {
        weather_code?: string;
        aqi_range?: string;
        limit?: string;
      };

      const limitNum = parseInt(limit);

      // Build weather search conditions
      const weatherWhere: any = {};
      const aqiWhere: any = {};

      // Weather condition filter
      if (weather_code !== undefined) {
        const code = parseInt(weather_code.toString());
        weatherWhere.weather_code = code;
      }

      // AQI range filter
      if (aqi_range) {
        const [min, max] = aqi_range.split('-').map(v => parseInt(v));
        if (!isNaN(min) && !isNaN(max)) {
          aqiWhere.aqi = {
            gte: min,
            lte: max
          };
        }
      }

      // Find provinces with matching weather conditions
      const provinces = await prisma.msProvince.findMany({
        include: {
          weather_data: {
            where: weatherWhere,
            orderBy: { recorded_at: 'desc' },
            take: 1
          },
          aqi_data: {
            where: aqiWhere,
            orderBy: { recorded_at: 'desc' },
            take: 1
          },
          weather_scores: {
            orderBy: { calculated_at: 'desc' },
            take: 1
          },
          places: {
            where: {
              posts: {
                some: {
                  status: 'approved'
                }
              }
            },
            include: {
              place_type: true,
              _count: {
                select: {
                  posts: {
                    where: { status: 'approved' }
                  }
                }
              },
              posts: {
                select: {
                  image: true,
                },
                take: 1
              }
            },
            take: 5, // Top 5 places per province
            orderBy: {
              posts: {
                _count: 'desc'
              }
            }
          }
        },
        take: limitNum
      });

      // Filter provinces that have matching weather or AQI data
      const filteredProvinces = provinces.filter(province => {
        const hasWeatherData = weather_code ? province.weather_data.length > 0 : true;
        const hasAqiData = aqi_range ? province.aqi_data.length > 0 : true;
        return hasWeatherData && hasAqiData && province.places.length > 0;
      });

      // Sort by weather score if available
      const sortedProvinces = filteredProvinces.sort((a, b) => {
        const scoreA = a.weather_scores[0]?.score || 0;
        const scoreB = b.weather_scores[0]?.score || 0;
        return Number(scoreB) - Number(scoreA);
      });

      res.json({
        success: true,
        message: `Found ${sortedProvinces.length} provinces matching weather conditions`,
        data: {
          provinces: sortedProvinces,
          total: sortedProvinces.length,
          filters: {
            weather_code: weather_code ? parseInt(weather_code.toString()) : null,
            aqi_range
          }
        }
      });

    } catch (error: any) {
      console.error('Error searching by weather:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching by weather conditions',
        error: error.message
      });
    }
  };

  /**
   * GET /api/search/suggestions - ค้นหาคำแนะนำสำหรับ autocomplete
   */
  getSuggestions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, type = 'all' } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
        return;
      }

      const searchTerm = query.trim();
      const suggestions: any[] = [];

      // Search places
      if (type === 'all' || type === 'places') {
        const places = await prisma.place.findMany({
          where: {
            name_place: { contains: searchTerm, mode: 'insensitive' }
          },
          select: {
            id_place: true,
            name_place: true,
            province: { select: { name: true } }
          },
          take: 5
        });

        suggestions.push(...places.map(place => ({
          type: 'place',
          id: place.id_place,
          text: place.name_place,
          subtitle: place.province.name
        })));
      }

      // Search provinces
      if (type === 'all' || type === 'provinces') {
        const provinces = await prisma.msProvince.findMany({
          where: {
            name: { contains: searchTerm, mode: 'insensitive' }
          },
          select: {
            id_province: true,
            name: true
          },
          take: 5
        });

        suggestions.push(...provinces.map(province => ({
          type: 'province',
          id: province.id_province,
          text: province.name,
          subtitle: 'จังหวัด'
        })));
      }

      res.json({
        success: true,
        data: suggestions.slice(0, 10) // Limit to 10 suggestions
      });

    } catch (error: any) {
      console.error('Error getting suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting suggestions',
        error: error.message
      });
    }
  };

  /**
   * GET /api/search/advanced - ค้นหาขั้นสูงที่รวมทั้งสถานที่และสภาพอากาศ
   */
  advancedSearch = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        query,
        weather_code,
        aqi_range,
        province_id,
        place_type_id,
        limit = '20'
      } = req.query;

      const limitNum = parseInt(limit as string);
      
      // Build comprehensive search
      let results: {
        places: any[];
        provinces: any[];
        total: number;
      } = {
        places: [],
        provinces: [],
        total: 0
      };

      // If there's a text query, search places
      if (query && typeof query === 'string') {
        const locationResults = await this.performLocationSearch({
          query,
          province_id: province_id as string,
          place_type_id: place_type_id as string,
          limit: Math.floor(limitNum / 2)
        });
        results.places = locationResults;
      }

      // If there are weather conditions, search by weather
      if (weather_code || aqi_range) {
        const weatherResults = await this.performWeatherSearch({
          weather_code: weather_code ? parseInt(weather_code as string) : undefined,
          aqi_range: aqi_range as string,
          limit: Math.floor(limitNum / 2)
        });
        results.provinces = weatherResults;
      }

      results.total = results.places.length + results.provinces.length;

      res.json({
        success: true,
        message: `Advanced search completed`,
        data: results
      });

    } catch (error: any) {
      console.error('Error in advanced search:', error);
      res.status(500).json({
        success: false,
        message: 'Error in advanced search',
        error: error.message
      });
    }
  };

  // Helper method for location search
  private async performLocationSearch(params: LocationSearchParams): Promise<any[]> {
    const { query, province_id, place_type_id, limit } = params;
    
    const where: any = {
      name_place: { contains: query, mode: 'insensitive' }
    };

    if (province_id) where.province_id = province_id;
    if (place_type_id) where.place_type_id = place_type_id;

    return await prisma.place.findMany({
      where,
      include: {
        place_type: true,
        province: true,
        _count: {
          select: {
            posts: { where: { status: 'approved' } }
          }
        }
      },
      take: limit || 10
    });
  }

  // Helper method for weather search
  private async performWeatherSearch(params: WeatherSearchParams): Promise<any[]> {
    const { weather_code, aqi_range, limit } = params;
    
    const weatherWhere: any = {};
    const aqiWhere: any = {};

    if (weather_code !== undefined) {
      weatherWhere.weather_code = weather_code;
    }

    if (aqi_range) {
      const [min, max] = aqi_range.split('-').map(v => parseInt(v));
      if (!isNaN(min) && !isNaN(max)) {
        aqiWhere.aqi = { gte: min, lte: max };
      }
    }

    const provinces = await prisma.msProvince.findMany({
      include: {
        weather_data: {
          where: weatherWhere,
          orderBy: { recorded_at: 'desc' },
          take: 1
        },
        aqi_data: {
          where: aqiWhere,
          orderBy: { recorded_at: 'desc' },
          take: 1
        },
        weather_scores: {
          orderBy: { calculated_at: 'desc' },
          take: 1
        }
      },
      take: limit || 10
    });

    return provinces.filter(province => {
      const hasWeatherData = weather_code ? province.weather_data.length > 0 : true;
      const hasAqiData = aqi_range ? province.aqi_data.length > 0 : true;
      return hasWeatherData && hasAqiData;
    });
  }
}

export const searchController = new SearchController();
