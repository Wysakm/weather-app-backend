"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.getProvincesWithPagination = exports.deleteProvince = exports.updateProvince = exports.createProvince = exports.getProvinceById = exports.getAllProvinces = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// Get all provinces
exports.getAllProvinces = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var provinces, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.msProvince.findMany({
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
                    })];
            case 1:
                provinces = _a.sent();
                res.status(200).json({
                    success: true,
                    data: provinces
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch provinces',
                    error: error_1.message
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Get province by ID
exports.getProvinceById = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var id, province, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, prisma.msProvince.findUnique({
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
                    })];
            case 1:
                province = _a.sent();
                if (!province) {
                    res.status(404).json({
                        success: false,
                        message: 'Province not found'
                    });
                    return [2 /*return*/];
                }
                res.status(200).json({
                    success: true,
                    data: province
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch province',
                    error: error_2.message
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Create new province
exports.createProvince = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, province_name, latitude, longitude, newProvince, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                console.log('Request body:', req.body);
                _a = req.body || {}, province_name = _a.province_name, latitude = _a.latitude, longitude = _a.longitude;
                // Validate required fields
                if (!province_name || !latitude || !longitude) {
                    res.status(400).json({
                        success: false,
                        message: 'Province name, latitude, and longitude are required',
                        received: { province_name: province_name, latitude: latitude, longitude: longitude }
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.msProvince.create({
                        data: {
                            name: province_name,
                            latitude: parseFloat(latitude),
                            longitude: parseFloat(longitude)
                        }
                    })];
            case 1:
                newProvince = _b.sent();
                res.status(201).json({
                    success: true,
                    message: 'Province created successfully',
                    data: newProvince
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _b.sent();
                console.error('Create province error:', error_3);
                res.status(500).json({
                    success: false,
                    message: 'Failed to create province',
                    error: error_3.message
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Update province
exports.updateProvince = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var id, _a, province_name, latitude, longitude, existingProvince, updateData, updatedProvince, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id = req.params.id;
                _a = req.body, province_name = _a.province_name, latitude = _a.latitude, longitude = _a.longitude;
                return [4 /*yield*/, prisma.msProvince.findUnique({
                        where: { id_province: id }
                    })];
            case 1:
                existingProvince = _b.sent();
                if (!existingProvince) {
                    res.status(404).json({
                        success: false,
                        message: 'Province not found'
                    });
                    return [2 /*return*/];
                }
                updateData = {};
                if (province_name)
                    updateData.name = province_name; // เปลี่ยนจาก province_name เป็น name
                if (latitude)
                    updateData.latitude = parseFloat(latitude);
                if (longitude)
                    updateData.longitude = parseFloat(longitude);
                return [4 /*yield*/, prisma.msProvince.update({
                        where: { id_province: id },
                        data: updateData
                    })];
            case 2:
                updatedProvince = _b.sent();
                res.status(200).json({
                    success: true,
                    message: 'Province updated successfully',
                    data: updatedProvince
                });
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                res.status(500).json({
                    success: false,
                    message: 'Failed to update province',
                    error: error_4.message
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// Delete province
exports.deleteProvince = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var id, existingProvince, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                return [4 /*yield*/, prisma.msProvince.findUnique({
                        where: { id_province: id },
                        include: {
                            places: true,
                            weather_data: true,
                            aqi_data: true
                        }
                    })];
            case 1:
                existingProvince = _a.sent();
                if (!existingProvince) {
                    res.status(404).json({
                        success: false,
                        message: 'Province not found'
                    });
                    return [2 /*return*/];
                }
                // Check if province has related data
                if (existingProvince.places.length > 0 ||
                    existingProvince.weather_data.length > 0 ||
                    existingProvince.aqi_data.length > 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Cannot delete province with existing places, weather data, or AQI data'
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.msProvince["delete"]({
                        where: { id_province: id }
                    })];
            case 2:
                _a.sent();
                res.status(200).json({
                    success: true,
                    message: 'Province deleted successfully'
                });
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete province',
                    error: error_5.message
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// Get provinces with pagination
exports.getProvincesWithPagination = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, _b, page, _c, limit, search, skip, where, _d, provinces, total, error_6;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 2, , 3]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? '1' : _b, _c = _a.limit, limit = _c === void 0 ? '10' : _c, search = _a.search;
                skip = (parseInt(page) - 1) * parseInt(limit);
                where = search ? {
                    name: {
                        contains: search,
                        mode: 'insensitive'
                    }
                } : {};
                return [4 /*yield*/, Promise.all([
                        prisma.msProvince.findMany({
                            where: where,
                            skip: skip,
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
                        prisma.msProvince.count({ where: where })
                    ])];
            case 1:
                _d = _e.sent(), provinces = _d[0], total = _d[1];
                res.status(200).json({
                    success: true,
                    data: provinces,
                    pagination: {
                        total: total,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(total / parseInt(limit))
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _e.sent();
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch provinces',
                    error: error_6.message
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
