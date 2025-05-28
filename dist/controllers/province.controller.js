"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvincesWithPagination = exports.deleteProvince = exports.updateProvince = exports.createProvince = exports.getProvinceById = exports.getAllProvinces = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all provinces
const getAllProvinces = async (req, res) => {
    try {
        const provinces = await prisma.msProvince.findMany({
            include: {
                places: true,
                weather_data: true,
                aqi_data: true,
                _count: {
                    select: {
                        places: true,
                        weather_data: true,
                        aqi_data: true
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            data: provinces
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch provinces',
            error: error.message
        });
    }
};
exports.getAllProvinces = getAllProvinces;
// Get province by ID
const getProvinceById = async (req, res) => {
    try {
        const { id } = req.params;
        const province = await prisma.msProvince.findUnique({
            where: { id_province: id },
            include: {
                places: true,
                weather_data: {
                    orderBy: { recorded_at: 'desc' },
                    take: 10
                },
                aqi_data: {
                    orderBy: { recorded_at: 'desc' },
                    take: 10
                }
            }
        });
        if (!province) {
            res.status(404).json({
                success: false,
                message: 'Province not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: province
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch province',
            error: error.message
        });
    }
};
exports.getProvinceById = getProvinceById;
// Create new province
const createProvince = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const { province_name, latitude, longitude } = req.body || {};
        // Validate required fields
        if (!province_name || !latitude || !longitude) {
            res.status(400).json({
                success: false,
                message: 'Province name, latitude, and longitude are required',
                received: { province_name, latitude, longitude }
            });
            return;
        }
        const newProvince = await prisma.msProvince.create({
            data: {
                name: province_name, // เปลี่ยนจาก province_name เป็น name
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            }
        });
        res.status(201).json({
            success: true,
            message: 'Province created successfully',
            data: newProvince
        });
    }
    catch (error) {
        console.error('Create province error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create province',
            error: error.message
        });
    }
};
exports.createProvince = createProvince;
// Update province
const updateProvince = async (req, res) => {
    try {
        const { id } = req.params;
        const { province_name, latitude, longitude } = req.body;
        // Check if province exists
        const existingProvince = await prisma.msProvince.findUnique({
            where: { id_province: id }
        });
        if (!existingProvince) {
            res.status(404).json({
                success: false,
                message: 'Province not found'
            });
            return;
        }
        const updateData = {};
        if (province_name)
            updateData.name = province_name; // เปลี่ยนจาก province_name เป็น name
        if (latitude)
            updateData.latitude = parseFloat(latitude);
        if (longitude)
            updateData.longitude = parseFloat(longitude);
        const updatedProvince = await prisma.msProvince.update({
            where: { id_province: id },
            data: updateData
        });
        res.status(200).json({
            success: true,
            message: 'Province updated successfully',
            data: updatedProvince
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update province',
            error: error.message
        });
    }
};
exports.updateProvince = updateProvince;
// Delete province
const deleteProvince = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if province exists
        const existingProvince = await prisma.msProvince.findUnique({
            where: { id_province: id },
            include: {
                places: true,
                weather_data: true,
                aqi_data: true
            }
        });
        if (!existingProvince) {
            res.status(404).json({
                success: false,
                message: 'Province not found'
            });
            return;
        }
        // Check if province has related data
        if (existingProvince.places.length > 0 ||
            existingProvince.weather_data.length > 0 ||
            existingProvince.aqi_data.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Cannot delete province with existing places, weather data, or AQI data'
            });
            return;
        }
        await prisma.msProvince.delete({
            where: { id_province: id }
        });
        res.status(200).json({
            success: true,
            message: 'Province deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete province',
            error: error.message
        });
    }
};
exports.deleteProvince = deleteProvince;
// Get provinces with pagination
const getProvincesWithPagination = async (req, res) => {
    try {
        const { page = '1', limit = '10', search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = search ? {
            name: {
                contains: search,
                mode: 'insensitive'
            }
        } : {};
        const [provinces, total] = await Promise.all([
            prisma.msProvince.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    _count: {
                        select: {
                            places: true,
                            weather_data: true,
                            aqi_data: true
                        }
                    }
                }
            }),
            prisma.msProvince.count({ where })
        ]);
        res.status(200).json({
            success: true,
            data: provinces,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch provinces',
            error: error.message
        });
    }
};
exports.getProvincesWithPagination = getProvincesWithPagination;
