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
exports.weatherController = exports.WeatherController = void 0;
var client_1 = require("@prisma/client");
var weatherService_1 = require("../services/weatherService");
var prisma = new client_1.PrismaClient();
var WeatherController = /** @class */ (function () {
    function WeatherController() {
        var _this = this;
        // GET /api/weather - ดึงข้อมูลสภาพอากาศทั้งหมด
        this.getAllWeatherData = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var weatherData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, prisma.weatherData.findMany({
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
                            })];
                    case 1:
                        weatherData = _a.sent();
                        res.json({
                            success: true,
                            data: weatherData
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error fetching weather data',
                            error: error_1.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // GET /api/weather/place/:placeId - ดึงข้อมูลสภาพอากาศของสถานที่
        this.getWeatherByPlace = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var placeId, _a, limit, weatherData, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        placeId = req.params.placeId;
                        _a = req.query.limit, limit = _a === void 0 ? 10 : _a;
                        return [4 /*yield*/, prisma.weatherData.findMany({
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
                                take: parseInt(limit)
                            })];
                    case 1:
                        weatherData = _b.sent();
                        res.json({
                            success: true,
                            data: weatherData
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error fetching weather data for place',
                            error: error_2.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // GET /api/weather/province/:provinceId - ดึงข้อมูลสภาพอากาศของจังหวัด
        this.getWeatherByProvince = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var provinceId, weatherData, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        provinceId = req.params.provinceId;
                        return [4 /*yield*/, prisma.weatherData.findMany({
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
                            })];
                    case 1:
                        weatherData = _a.sent();
                        res.json({
                            success: true,
                            data: weatherData
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error fetching weather data for province',
                            error: error_3.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // GET /api/weather/latest - ดึงข้อมูลสภาพอากาศล่าสุดของแต่ละจังหวัด
        this.getLatestWeatherData = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var latestWeatherData, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, prisma.weatherData.findMany({
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
                            })];
                    case 1:
                        latestWeatherData = _a.sent();
                        res.json({
                            success: true,
                            data: latestWeatherData
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error fetching latest weather data',
                            error: error_4.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // POST /api/weather/fetch - ดึงข้อมูลสภาพอากาศและเก็บลง database
        this.fetchAndStoreWeatherData = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var _a, clear, weatherService, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query.clear, clear = _a === void 0 ? false : _a;
                        weatherService = new weatherService_1.WeatherService();
                        return [4 /*yield*/, weatherService.fetchAndStoreWeatherData(clear === 'true')];
                    case 1:
                        _b.sent();
                        res.json({
                            success: true,
                            message: 'Weather and AQI data fetched and stored successfully'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _b.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error fetching and storing weather data',
                            error: error_5.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // POST /api/weather/fetch/province/:provinceId - ดึงข้อมูลสภาพอากาศของจังหวัดเฉพาะ
        this.fetchWeatherForProvince = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var provinceId, weatherService, result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        provinceId = req.params.provinceId;
                        weatherService = new weatherService_1.WeatherService();
                        return [4 /*yield*/, weatherService.fetchWeatherForProvince(provinceId)];
                    case 1:
                        result = _a.sent();
                        res.json({
                            success: true,
                            data: result,
                            message: "Weather data fetched for " + result.province
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error fetching weather data for province',
                            error: error_6.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // POST /api/weather/clear - ล้างข้อมูลสภาพอากาศเก่า
        this.clearWeatherData = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var weatherService, result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        weatherService = new weatherService_1.WeatherService();
                        return [4 /*yield*/, weatherService.clearOldWeatherData()];
                    case 1:
                        result = _a.sent();
                        res.json({
                            success: true,
                            message: 'Old weather data cleared successfully',
                            data: result
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error clearing weather data',
                            error: error_7.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // POST /api/weather/refresh - ล้างข้อมูลเก่าแล้วดึงใหม่
        this.refreshWeatherData = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var weatherService, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        weatherService = new weatherService_1.WeatherService();
                        // ล้างข้อมูลเก่าแล้วดึงใหม่ในคำสั่งเดียว
                        return [4 /*yield*/, weatherService.fetchAndStoreWeatherData(true)];
                    case 1:
                        // ล้างข้อมูลเก่าแล้วดึงใหม่ในคำสั่งเดียว
                        _a.sent();
                        res.json({
                            success: true,
                            message: 'Weather data refreshed successfully with correct timezone'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error refreshing weather data',
                            error: error_8.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // POST /api/weather/auto/start - เริ่ม auto fetch
        this.startAutoFetch = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var weatherService;
            return __generator(this, function (_a) {
                try {
                    weatherService = new weatherService_1.WeatherService();
                    weatherService.startAutoFetch();
                    res.json({
                        success: true,
                        message: 'Automatic weather fetching started (every 30 minutes)'
                    });
                }
                catch (error) {
                    res.status(500).json({
                        success: false,
                        message: 'Error starting auto fetch',
                        error: error.message
                    });
                }
                return [2 /*return*/];
            });
        }); };
        // POST /api/weather/auto/stop - หยุด auto fetch
        this.stopAutoFetch = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var weatherService;
            return __generator(this, function (_a) {
                try {
                    weatherService = new weatherService_1.WeatherService();
                    weatherService.stopAutoFetch();
                    res.json({
                        success: true,
                        message: 'Automatic weather fetching stopped'
                    });
                }
                catch (error) {
                    res.status(500).json({
                        success: false,
                        message: 'Error stopping auto fetch',
                        error: error.message
                    });
                }
                return [2 /*return*/];
            });
        }); };
        // GET /api/weather/health - ตรวจสอบสถานะของระบบ
        this.getSystemHealth = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var weatherService, health, statusCode, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        weatherService = new weatherService_1.WeatherService();
                        return [4 /*yield*/, weatherService.getSystemHealth()];
                    case 1:
                        health = _a.sent();
                        statusCode = health.status === 'healthy' ? 200 :
                            health.status === 'degraded' ? 207 : 503;
                        res.status(statusCode).json({
                            success: true,
                            data: health
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error checking system health',
                            error: error_9.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // GET /api/weather/statistics - ดึงสถิติการใช้งานระบบ
        this.getSystemStatistics = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var weatherService, statistics, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        weatherService = new weatherService_1.WeatherService();
                        return [4 /*yield*/, weatherService.getSystemStatistics()];
                    case 1:
                        statistics = _a.sent();
                        res.json({
                            success: true,
                            data: statistics
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error fetching system statistics',
                            error: error_10.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // POST /api/weather/update-batch - อัพเดทข้อมูลแบบ batch พร้อมสถิติ
        this.updateWeatherDataBatch = function (req, res) { return __awaiter(_this, void 0, Promise, function () {
            var _a, clearOldData, weatherService, stats, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body.clearOldData, clearOldData = _a === void 0 ? false : _a;
                        weatherService = new weatherService_1.WeatherService();
                        return [4 /*yield*/, weatherService.fetchAndStoreWeatherData(clearOldData)];
                    case 1:
                        stats = _b.sent();
                        res.json({
                            success: true,
                            message: 'Weather data updated successfully',
                            statistics: stats
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _b.sent();
                        res.status(500).json({
                            success: false,
                            message: 'Error updating weather data',
                            error: error_11.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    }
    return WeatherController;
}());
exports.WeatherController = WeatherController;
exports.weatherController = new WeatherController();
