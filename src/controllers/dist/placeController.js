"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
                        _a = req.query, _b = _a.page, page = _b === void 0 ? '1' : _b, _c = _a.limit, limit = _c === void 0 ? '10' : _c, province_id = _a.province_id, place_type_id = _a.place_type_id, search = _a.search;
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
            var _a, name_place, latitude, longitude, type_name, province_name, district, sub_district, place_image, google_place_id, google_place_data // เพิ่มข้อมูลเพิ่มเติมจาก Google Places
            , existingPlaceByGoogleId, existingPlaceByName, existingPlaceByCoords, placeType, selectedProvinceId, foundProvince, defaultProvince, place, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 11, , 12]);
                        _a = req.body, name_place = _a.name_place, latitude = _a.latitude, longitude = _a.longitude, type_name = _a.type_name, province_name = _a.province_name, district = _a.district, sub_district = _a.sub_district, place_image = _a.place_image, google_place_id = _a.google_place_id, google_place_data = _a.google_place_data;
                        // Validate required fields
                        if (!name_place || !latitude || !longitude || !type_name) {
                            res.status(400).json({
                                success: false,
                                message: 'name_place, latitude, longitude, and type_name are required'
                            });
                            return [2 /*return*/];
                        }
                        if (!google_place_id) return [3 /*break*/, 2];
                        return [4 /*yield*/, prisma.place.findFirst({
                                where: {
                                    gg_ref: google_place_id
                                }
                            })];
                    case 1:
                        existingPlaceByGoogleId = _b.sent();
                        if (existingPlaceByGoogleId) {
                            res.status(409).json({
                                success: false,
                                message: "Place with Google Place ID '" + google_place_id + "' already exists",
                                existingPlace: {
                                    id: existingPlaceByGoogleId.id_place,
                                    name: existingPlaceByGoogleId.name_place
                                }
                            });
                            return [2 /*return*/];
                        }
                        _b.label = 2;
                    case 2: return [4 /*yield*/, prisma.place.findFirst({
                            where: {
                                name_place: {
                                    equals: name_place,
                                    mode: 'insensitive'
                                }
                            }
                        })];
                    case 3:
                        existingPlaceByName = _b.sent();
                        if (existingPlaceByName) {
                            res.status(409).json({
                                success: false,
                                message: "Place with name '" + name_place + "' already exists"
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.place.findFirst({
                                where: {
                                    latitude: parseFloat(latitude.toString()),
                                    longitude: parseFloat(longitude.toString())
                                }
                            })];
                    case 4:
                        existingPlaceByCoords = _b.sent();
                        if (existingPlaceByCoords) {
                            res.status(409).json({
                                success: false,
                                message: "Place with coordinates (" + latitude + ", " + longitude + ") already exists"
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.placeType.findFirst({
                                where: {
                                    type_name: {
                                        contains: type_name,
                                        mode: 'insensitive'
                                    }
                                }
                            })];
                    case 5:
                        placeType = _b.sent();
                        if (!placeType) {
                            res.status(400).json({
                                success: false,
                                message: "Place type '" + type_name + "' not found"
                            });
                            return [2 /*return*/];
                        }
                        selectedProvinceId = void 0;
                        if (!province_name) return [3 /*break*/, 7];
                        return [4 /*yield*/, prisma.msProvince.findFirst({
                                where: {
                                    name: {
                                        contains: province_name,
                                        mode: 'insensitive'
                                    }
                                }
                            })];
                    case 6:
                        foundProvince = _b.sent();
                        if (foundProvince) {
                            selectedProvinceId = foundProvince.id_province;
                        }
                        else {
                            res.status(400).json({
                                success: false,
                                message: "Province '" + province_name + "' not found"
                            });
                            return [2 /*return*/];
                        }
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, prisma.msProvince.findFirst({
                            where: { name: 'Bangkok' }
                        })];
                    case 8:
                        defaultProvince = _b.sent();
                        if (!defaultProvince) {
                            res.status(400).json({
                                success: false,
                                message: 'No default province found. Please specify province_name'
                            });
                            return [2 /*return*/];
                        }
                        selectedProvinceId = defaultProvince.id_province;
                        _b.label = 9;
                    case 9: return [4 /*yield*/, prisma.place.create({
                            data: {
                                name_place: name_place,
                                latitude: parseFloat(latitude.toString()),
                                longitude: parseFloat(longitude.toString()),
                                place_type_id: placeType.id_place_type,
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
                        })];
                    case 10:
                        place = _b.sent();
                        res.status(201).json({
                            success: true,
                            data: place,
                            message: 'Place created successfully'
                        });
                        return [3 /*break*/, 12];
                    case 11:
                        error_3 = _b.sent();
                        console.error('Error creating place:', error_3);
                        res.status(500).json({
                            success: false,
                            message: 'Error creating place',
                            error: error_3.message
                        });
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        }); };
        // POST /api/places/google - เพิ่มสถานที่จาก Google Places API
        this.createPlaceFromGoogle = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var _a, google_place_id, google_place_data, _b, type_name, existingPlace, name, _c, lat, lng, formatted_address, types, photos, vicinity, existingPlaceByName, existingPlaceByCoords, placeType, selectedProvinceId, addressParts, provinceFound, _i, addressParts_1, part, trimmedPart, foundProvince, defaultProvince, placeImage, place, error_4;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 12, , 13]);
                        _a = req.body, google_place_id = _a.google_place_id, google_place_data = _a.google_place_data, _b = _a.type_name, type_name = _b === void 0 ? 'Tourist Attraction' // default place type
                         : _b;
                        // Validate required fields
                        if (!google_place_id || !google_place_data) {
                            res.status(400).json({
                                success: false,
                                message: 'google_place_id and google_place_data are required'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.place.findFirst({
                                where: {
                                    gg_ref: google_place_id
                                }
                            })];
                    case 1:
                        existingPlace = _d.sent();
                        if (existingPlace) {
                            res.status(409).json({
                                success: false,
                                message: "Place with Google Place ID '" + google_place_id + "' already exists",
                                existingPlace: {
                                    id: existingPlace.id_place,
                                    name: existingPlace.name_place,
                                    google_place_id: existingPlace.gg_ref
                                }
                            });
                            return [2 /*return*/];
                        }
                        name = google_place_data.name, _c = google_place_data.geometry.location, lat = _c.lat, lng = _c.lng, formatted_address = google_place_data.formatted_address, types = google_place_data.types, photos = google_place_data.photos, vicinity = google_place_data.vicinity;
                        return [4 /*yield*/, prisma.place.findFirst({
                                where: {
                                    name_place: {
                                        equals: name,
                                        mode: 'insensitive'
                                    }
                                }
                            })];
                    case 2:
                        existingPlaceByName = _d.sent();
                        if (existingPlaceByName) {
                            res.status(409).json({
                                success: false,
                                message: "Place with name '" + name + "' already exists",
                                existingPlace: {
                                    id: existingPlaceByName.id_place,
                                    name: existingPlaceByName.name_place
                                }
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.place.findFirst({
                                where: {
                                    latitude: lat,
                                    longitude: lng
                                }
                            })];
                    case 3:
                        existingPlaceByCoords = _d.sent();
                        if (existingPlaceByCoords) {
                            res.status(409).json({
                                success: false,
                                message: "Place with coordinates (" + lat + ", " + lng + ") already exists",
                                existingPlace: {
                                    id: existingPlaceByCoords.id_place,
                                    name: existingPlaceByCoords.name_place
                                }
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.placeType.findFirst({
                                where: {
                                    type_name: {
                                        contains: type_name,
                                        mode: 'insensitive'
                                    }
                                }
                            })];
                    case 4:
                        placeType = _d.sent();
                        if (!placeType) {
                            res.status(400).json({
                                success: false,
                                message: "Place type '" + type_name + "' not found"
                            });
                            return [2 /*return*/];
                        }
                        selectedProvinceId = '';
                        addressParts = (formatted_address === null || formatted_address === void 0 ? void 0 : formatted_address.split(',')) || [];
                        provinceFound = false;
                        _i = 0, addressParts_1 = addressParts;
                        _d.label = 5;
                    case 5:
                        if (!(_i < addressParts_1.length)) return [3 /*break*/, 8];
                        part = addressParts_1[_i];
                        trimmedPart = part.trim();
                        return [4 /*yield*/, prisma.msProvince.findFirst({
                                where: {
                                    name: {
                                        contains: trimmedPart,
                                        mode: 'insensitive'
                                    }
                                }
                            })];
                    case 6:
                        foundProvince = _d.sent();
                        if (foundProvince) {
                            selectedProvinceId = foundProvince.id_province;
                            provinceFound = true;
                            return [3 /*break*/, 8];
                        }
                        _d.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8:
                        if (!!provinceFound) return [3 /*break*/, 10];
                        return [4 /*yield*/, prisma.msProvince.findFirst({
                                where: { name: 'Bangkok' }
                            })];
                    case 9:
                        defaultProvince = _d.sent();
                        if (!defaultProvince) {
                            res.status(400).json({
                                success: false,
                                message: 'No default province found'
                            });
                            return [2 /*return*/];
                        }
                        selectedProvinceId = defaultProvince.id_province;
                        _d.label = 10;
                    case 10:
                        placeImage = null;
                        if (photos && photos.length > 0) {
                            // Store the photo reference for now
                            placeImage = photos[0].photo_reference;
                        }
                        return [4 /*yield*/, prisma.place.create({
                                data: {
                                    name_place: name,
                                    latitude: lat,
                                    longitude: lng,
                                    place_type_id: placeType.id_place_type,
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
                            })];
                    case 11:
                        place = _d.sent();
                        res.status(201).json({
                            success: true,
                            data: place,
                            message: 'Place created from Google Places API successfully'
                        });
                        return [3 /*break*/, 13];
                    case 12:
                        error_4 = _d.sent();
                        console.error('Error creating place from Google:', error_4);
                        res.status(500).json({
                            success: false,
                            message: 'Error creating place from Google Places API',
                            error: error_4.message
                        });
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        }); };
        // GET /api/places/check-google/:google_place_id - ตรวจสอบว่าสถานที่จาก Google มีอยู่แล้วหรือไม่
        this.checkGooglePlace = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var google_place_id, existingPlace, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        google_place_id = req.params.google_place_id;
                        return [4 /*yield*/, prisma.place.findFirst({
                                where: {
                                    gg_ref: google_place_id
                                },
                                include: {
                                    place_type: true,
                                    province: true
                                }
                            })];
                    case 1:
                        existingPlace = _a.sent();
                        if (existingPlace) {
                            res.json({
                                success: true,
                                exists: true,
                                data: existingPlace,
                                message: 'Place already exists in database'
                            });
                        }
                        else {
                            res.json({
                                success: true,
                                exists: false,
                                message: 'Place does not exist in database'
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error checking Google place',
                            error: error_5.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // DELETE /api/places/:id - ลบสถานที่
        this.deletePlace = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var id_1, force, existingPlace, hasRelatedData, error_6;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        id_1 = req.params.id;
                        force = req.query.force;
                        return [4 /*yield*/, prisma.place.findUnique({
                                where: { id_place: id_1 },
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
                        // หากมีข้อมูลที่เกี่ยวข้องและไม่มี force parameter
                        if (hasRelatedData && force !== 'true') {
                            res.status(400).json({
                                success: false,
                                message: 'Cannot delete place with related data (posts, weather data, or AQI data). Use ?force=true to force delete.',
                                relatedData: {
                                    posts: existingPlace._count.posts,
                                    weather_data: existingPlace._count.weather_data,
                                    aqi_data: existingPlace._count.aqi_data
                                }
                            });
                            return [2 /*return*/];
                        }
                        if (!(force === 'true' && hasRelatedData)) return [3 /*break*/, 3];
                        return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: 
                                        // ลบ posts ที่เกี่ยวข้อง
                                        return [4 /*yield*/, tx.post.deleteMany({
                                                where: { id_place: id_1 }
                                            })];
                                        case 1:
                                            // ลบ posts ที่เกี่ยวข้อง
                                            _a.sent();
                                            // ลบ weather_data ที่เกี่ยวข้อง
                                            return [4 /*yield*/, tx.weatherData.deleteMany({
                                                    where: { id_place: id_1 }
                                                })];
                                        case 2:
                                            // ลบ weather_data ที่เกี่ยวข้อง
                                            _a.sent();
                                            // ลบ aqi_data ที่เกี่ยวข้อง
                                            return [4 /*yield*/, tx.aqiData.deleteMany({
                                                    where: { id_place: id_1 }
                                                })];
                                        case 3:
                                            // ลบ aqi_data ที่เกี่ยวข้อง
                                            _a.sent();
                                            // ลบ place
                                            return [4 /*yield*/, tx.place["delete"]({
                                                    where: { id_place: id_1 }
                                                })];
                                        case 4:
                                            // ลบ place
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        res.json({
                            success: true,
                            message: 'Place and all related data deleted successfully (force delete)',
                            deletedData: {
                                posts: existingPlace._count.posts,
                                weather_data: existingPlace._count.weather_data,
                                aqi_data: existingPlace._count.aqi_data
                            }
                        });
                        return [3 /*break*/, 5];
                    case 3: 
                    // ลบ place ปกติ (ไม่มีข้อมูลที่เกี่ยวข้อง)
                    return [4 /*yield*/, prisma.place["delete"]({
                            where: { id_place: id_1 }
                        })];
                    case 4:
                        // ลบ place ปกติ (ไม่มีข้อมูลที่เกี่ยวข้อง)
                        _a.sent();
                        res.json({
                            success: true,
                            message: 'Place deleted successfully'
                        });
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_6 = _a.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error deleting place',
                            error: error_6.message
                        });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        // GET /api/places/nearby - ค้นหาสถานที่ใกล้เคียง
        this.getNearbyPlaces = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var _a, latitude, longitude, _b, radius, lat, lng, radiusKm, places, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _a = req.query, latitude = _a.latitude, longitude = _a.longitude, _b = _a.radius, radius = _b === void 0 ? '10' : _b;
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
                        error_7 = _c.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error fetching nearby places',
                            error: error_7.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // PUT /api/places/:id - อัปเดตข้อมูลสถานที่
        this.updatePlace = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var id, _a, name_place, latitude, longitude, type_name, province_name, district, sub_district, place_image, google_place_id, google_place_data, existingPlace, duplicateName, duplicateCoords, duplicateGoogleId, placeTypeId, placeType, provinceId, province, updatedPlace, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 13, , 14]);
                        id = req.params.id;
                        _a = req.body, name_place = _a.name_place, latitude = _a.latitude, longitude = _a.longitude, type_name = _a.type_name, province_name = _a.province_name, district = _a.district, sub_district = _a.sub_district, place_image = _a.place_image, google_place_id = _a.google_place_id, google_place_data = _a.google_place_data;
                        return [4 /*yield*/, prisma.place.findUnique({
                                where: { id_place: id }
                            })];
                    case 1:
                        existingPlace = _b.sent();
                        if (!existingPlace) {
                            res.status(404).json({
                                success: false,
                                message: 'Place not found'
                            });
                            return [2 /*return*/];
                        }
                        if (!(name_place && name_place !== existingPlace.name_place)) return [3 /*break*/, 3];
                        return [4 /*yield*/, prisma.place.findFirst({
                                where: {
                                    name_place: {
                                        equals: name_place,
                                        mode: 'insensitive'
                                    },
                                    id_place: {
                                        not: id
                                    }
                                }
                            })];
                    case 2:
                        duplicateName = _b.sent();
                        if (duplicateName) {
                            res.status(409).json({
                                success: false,
                                message: "Place with name '" + name_place + "' already exists"
                            });
                            return [2 /*return*/];
                        }
                        _b.label = 3;
                    case 3:
                        if (!(latitude && longitude)) return [3 /*break*/, 5];
                        return [4 /*yield*/, prisma.place.findFirst({
                                where: {
                                    latitude: parseFloat(latitude.toString()),
                                    longitude: parseFloat(longitude.toString()),
                                    id_place: {
                                        not: id
                                    }
                                }
                            })];
                    case 4:
                        duplicateCoords = _b.sent();
                        if (duplicateCoords) {
                            res.status(409).json({
                                success: false,
                                message: "Place with coordinates (" + latitude + ", " + longitude + ") already exists"
                            });
                            return [2 /*return*/];
                        }
                        _b.label = 5;
                    case 5:
                        if (!(google_place_id && google_place_id !== existingPlace.gg_ref)) return [3 /*break*/, 7];
                        return [4 /*yield*/, prisma.place.findFirst({
                                where: {
                                    gg_ref: google_place_id,
                                    id_place: {
                                        not: id
                                    }
                                }
                            })];
                    case 6:
                        duplicateGoogleId = _b.sent();
                        if (duplicateGoogleId) {
                            res.status(409).json({
                                success: false,
                                message: "Place with Google Place ID '" + google_place_id + "' already exists"
                            });
                            return [2 /*return*/];
                        }
                        _b.label = 7;
                    case 7:
                        placeTypeId = existingPlace.place_type_id;
                        if (!type_name) return [3 /*break*/, 9];
                        return [4 /*yield*/, prisma.placeType.findFirst({
                                where: {
                                    type_name: {
                                        contains: type_name,
                                        mode: 'insensitive'
                                    }
                                }
                            })];
                    case 8:
                        placeType = _b.sent();
                        if (!placeType) {
                            res.status(400).json({
                                success: false,
                                message: "Place type '" + type_name + "' not found"
                            });
                            return [2 /*return*/];
                        }
                        placeTypeId = placeType.id_place_type;
                        _b.label = 9;
                    case 9:
                        provinceId = existingPlace.province_id;
                        if (!province_name) return [3 /*break*/, 11];
                        return [4 /*yield*/, prisma.msProvince.findFirst({
                                where: {
                                    name: {
                                        contains: province_name,
                                        mode: 'insensitive'
                                    }
                                }
                            })];
                    case 10:
                        province = _b.sent();
                        if (!province) {
                            res.status(400).json({
                                success: false,
                                message: "Province '" + province_name + "' not found"
                            });
                            return [2 /*return*/];
                        }
                        provinceId = province.id_province;
                        _b.label = 11;
                    case 11: return [4 /*yield*/, prisma.place.update({
                            where: { id_place: id },
                            data: __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, (name_place && { name_place: name_place })), (latitude && { latitude: parseFloat(latitude.toString()) })), (longitude && { longitude: parseFloat(longitude.toString()) })), { place_type_id: placeTypeId, province_id: provinceId }), (district !== undefined && { district: district || null })), (sub_district !== undefined && { sub_district: sub_district || null })), (place_image !== undefined && { place_image: place_image || null })), (google_place_id !== undefined && { gg_ref: google_place_id || null })), { updated_at: new Date() }),
                            include: {
                                place_type: true,
                                province: true
                            }
                        })];
                    case 12:
                        updatedPlace = _b.sent();
                        res.json({
                            success: true,
                            data: updatedPlace,
                            message: 'Place updated successfully'
                        });
                        return [3 /*break*/, 14];
                    case 13:
                        error_8 = _b.sent();
                        console.error('Error updating place:', error_8);
                        res.status(500).json({
                            success: false,
                            message: 'Error updating place',
                            error: error_8.message
                        });
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/];
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
