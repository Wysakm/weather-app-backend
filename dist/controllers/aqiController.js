"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aqiController = exports.AqiController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AqiController {
    constructor() {
        // GET /api/aqi - ดึงข้อมูลคุณภาพอากาศทั้งหมด
        this.getAllAqiData = async (req, res) => {
            try {
                const aqiData = await prisma.aqiData.findMany({
                    include: {
                        place: {
                            include: {
                                place_type: true,
                                province: true
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                });
                res.json({
                    success: true,
                    data: aqiData
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error fetching AQI data',
                    error: error.message
                });
            }
        };
        // GET /api/aqi/place/:placeId - ดึงข้อมูลคุณภาพอากาศของสถานที่
        this.getAqiByPlace = async (req, res) => {
            try {
                const { placeId } = req.params;
                const { limit = 10 } = req.query;
                const aqiData = await prisma.aqiData.findMany({
                    where: {
                        id_place: placeId
                    },
                    include: {
                        place: {
                            include: {
                                place_type: true,
                                province: true
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'desc'
                    },
                    take: parseInt(limit)
                });
                res.json({
                    success: true,
                    data: aqiData
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error fetching AQI data for place',
                    error: error.message
                });
            }
        };
        // GET /api/aqi/latest - ดึงข้อมูลคุณภาพอากาศล่าสุดของแต่ละสถานที่
        this.getLatestAqiData = async (req, res) => {
            try {
                const latestAqiData = await prisma.aqiData.findMany({
                    distinct: ['id_place'],
                    include: {
                        place: {
                            include: {
                                place_type: true,
                                province: true
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                });
                res.json({
                    success: true,
                    data: latestAqiData
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error fetching latest AQI data',
                    error: error.message
                });
            }
        };
        // GET /api/aqi/quality/:level - ดึงข้อมูลตามระดับคุณภาพอากาศ
        this.getAqiByQualityLevel = async (req, res) => {
            try {
                const { level } = req.params;
                let aqiRange;
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
                        place: {
                            include: {
                                place_type: true,
                                province: true
                            }
                        }
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
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error fetching AQI data by quality level',
                    error: error.message
                });
            }
        };
    }
}
exports.AqiController = AqiController;
exports.aqiController = new AqiController();
