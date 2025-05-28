"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.placeController = exports.PlaceController = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var PlaceController = /** @class */ (function () {
    function PlaceController() {
        var _this = this;
        // GET /api/places - ดึงข้อมูลสถานที่ทั้งหมด
        this.getAllPlaces = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var _a, _b, page, _c, limit, province_id, place_type_id, search, skip, where, _d, places, total, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c, province_id = _a.province_id, place_type_id = _a.place_type_id, search = _a.search;
                        skip = (Number(page) - 1) * Number(limit);
                        where = {};
                        if (province_id)
                            where.province_id = province_id;
                        if (place_type_id)
                            where.place_type_id = place_type_id;
                        if (search) {
                            where.name_place = {
                                contains: search,
                                mode: 'insensitive'
                            };
                        }
                        return [4 /*yield*/, Promise.all([
                                prisma.place.findMany({
                                    where: where,
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
                                    skip: skip,
                                    take: Number(limit),
                                    orderBy: { created_at: 'desc' }
                                }),
                                prisma.place.count({ where: where })
                            ])];
                    case 1:
                        _d = _e.sent(), places = _d[0], total = _d[1];
                        res.json({
                            success: true,
                            data: places,
                            pagination: {
                                total: total,
                                page: Number(page),
                                limit: Number(limit),
                                totalPages: Math.ceil(total / Number(limit))
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _e.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error fetching places',
                            error: error_1.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // GET /api/places/:id - ดึงข้อมูลสถานที่ตาม ID
        this.getPlaceById = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var id, place, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, prisma.place.findUnique({
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
                            })];
                    case 1:
                        place = _a.sent();
                        if (!place) {
                            res.status(404).json({
                                success: false,
                                message: 'Place not found'
                            });
                            return [2 /*return*/];
                        }
                        res.json({
                            success: true,
                            data: place
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error fetching place',
                            error: error_2.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // POST /api/places - สร้างสถานที่ใหม่
        this.createPlace = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var _a, name_place, latitude, longitude, type_name, province_name, district, sub_district, place_image, placeType, province, place, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        _a = req.body, name_place = _a.name_place, latitude = _a.latitude, longitude = _a.longitude, type_name = _a.type_name, province_name = _a.province_name, district = _a.district, sub_district = _a.sub_district, place_image = _a.place_image;
                        return [4 /*yield*/, prisma.placeType.findFirst({
                                where: {
                                    type_name: {
                                        contains: type_name,
                                        mode: 'insensitive'
                                    }
                                }
                            })];
                    case 1:
                        placeType = _b.sent();
                        if (!placeType) {
                            res.status(400).json({
                                success: false,
                                message: "Place type '" + type_name + "' not found"
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.msProvince.findFirst()];
                    case 2:
                        province = _b.sent();
                        if (!province) {
                            res.status(400).json({
                                success: false,
                                message: 'No province found in database'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.place.create({
                                data: {
                                    name_place: name_place,
                                    latitude: latitude,
                                    longitude: longitude,
                                    place_type_id: placeType.id_place_type,
                                    province_id: province.id_province,
                                    district: district,
                                    sub_district: sub_district,
                                    place_image: place_image
                                }
                            })];
                    case 3:
                        place = _b.sent();
                        res.status(201).json({
                            success: true,
                            data: place,
                            message: 'Place created successfully'
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _b.sent();
                        console.error('Error creating place:', error_3);
                        res.status(500).json({
                            success: false,
                            message: 'Error creating place',
                            error: error_3.message
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        // PUT /api/places/:id - อัปเดตข้อมูลสถานที่
        this.updatePlace = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var id, updateData, existingPlace, placeType, province, place, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        id = req.params.id;
                        updateData = req.body;
                        return [4 /*yield*/, prisma.place.findUnique({
                                where: { id_place: id }
                            })];
                    case 1:
                        existingPlace = _a.sent();
                        if (!existingPlace) {
                            res.status(404).json({
                                success: false,
                                message: 'Place not found'
                            });
                            return [2 /*return*/];
                        }
                        if (!updateData.place_type_id) return [3 /*break*/, 3];
                        return [4 /*yield*/, prisma.placeType.findUnique({
                                where: { id_place_type: updateData.place_type_id }
                            })];
                    case 2:
                        placeType = _a.sent();
                        if (!placeType) {
                            res.status(400).json({
                                success: false,
                                message: 'Invalid place type'
                            });
                            return [2 /*return*/];
                        }
                        _a.label = 3;
                    case 3:
                        if (!updateData.province_id) return [3 /*break*/, 5];
                        return [4 /*yield*/, prisma.msProvince.findUnique({
                                where: { id_province: updateData.province_id }
                            })];
                    case 4:
                        province = _a.sent();
                        if (!province) {
                            res.status(400).json({
                                success: false,
                                message: 'Invalid province'
                            });
                            return [2 /*return*/];
                        }
                        _a.label = 5;
                    case 5: return [4 /*yield*/, prisma.place.update({
                            where: { id_place: id },
                            data: updateData,
                            include: {
                                place_type: true,
                                province: true
                            }
                        })];
                    case 6:
                        place = _a.sent();
                        res.json({
                            success: true,
                            data: place,
                            message: 'Place updated successfully'
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        error_4 = _a.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error updating place',
                            error: error_4.message
                        });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        // DELETE /api/places/:id - ลบสถานที่
        this.deletePlace = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var id, existingPlace, hasRelatedData, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        return [4 /*yield*/, prisma.place.findUnique({
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
                            })];
                    case 1:
                        existingPlace = _a.sent();
                        if (!existingPlace) {
                            res.status(404).json({
                                success: false,
                                message: 'Place not found'
                            });
                            return [2 /*return*/];
                        }
                        hasRelatedData = existingPlace._count.posts > 0 ||
                            existingPlace._count.weather_data > 0 ||
                            existingPlace._count.aqi_data > 0;
                        if (hasRelatedData) {
                            res.status(400).json({
                                success: false,
                                message: 'Cannot delete place with related data (posts, weather data, or AQI data)'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.place["delete"]({
                                where: { id_place: id }
                            })];
                    case 2:
                        _a.sent();
                        res.json({
                            success: true,
                            message: 'Place deleted successfully'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error deleting place',
                            error: error_5.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        // GET /api/places/nearby - ค้นหาสถานที่ใกล้เคียง
        this.getNearbyPlaces = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var _a, latitude, longitude, _b, radius, lat, lng, radiusKm, places, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _a = req.query, latitude = _a.latitude, longitude = _a.longitude, _b = _a.radius, radius = _b === void 0 ? 10 : _b;
                        if (!latitude || !longitude) {
                            res.status(400).json({
                                success: false,
                                message: 'Latitude and longitude are required'
                            });
                            return [2 /*return*/];
                        }
                        lat = parseFloat(latitude);
                        lng = parseFloat(longitude);
                        radiusKm = parseFloat(radius);
                        return [4 /*yield*/, prisma.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        SELECT p.*, pt.type_name, pr.name as province_name,\n               (6371 * acos(cos(radians(", ")) * cos(radians(CAST(p.latitude AS FLOAT))) * \n               cos(radians(CAST(p.longitude AS FLOAT)) - radians(", ")) + \n               sin(radians(", ")) * sin(radians(CAST(p.latitude AS FLOAT))))) AS distance\n        FROM place p\n        LEFT JOIN place_type pt ON p.place_type_id = pt.id_place_type\n        LEFT JOIN ms_province pr ON p.province_id = pr.id_province\n        HAVING distance <= ", "\n        ORDER BY distance\n      "], ["\n        SELECT p.*, pt.type_name, pr.name as province_name,\n               (6371 * acos(cos(radians(", ")) * cos(radians(CAST(p.latitude AS FLOAT))) * \n               cos(radians(CAST(p.longitude AS FLOAT)) - radians(", ")) + \n               sin(radians(", ")) * sin(radians(CAST(p.latitude AS FLOAT))))) AS distance\n        FROM place p\n        LEFT JOIN place_type pt ON p.place_type_id = pt.id_place_type\n        LEFT JOIN ms_province pr ON p.province_id = pr.id_province\n        HAVING distance <= ", "\n        ORDER BY distance\n      "])), lat, lng, lat, radiusKm)];
                    case 1:
                        places = _c.sent();
                        res.json({
                            success: true,
                            data: places
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _c.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error fetching nearby places',
                            error: error_6.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    }
    return PlaceController;
}());
exports.PlaceController = PlaceController;
// Export instance for use in routes
exports.placeController = new PlaceController();
var templateObject_1;
