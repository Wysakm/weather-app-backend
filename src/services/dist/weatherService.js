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
exports.WeatherService = void 0;
var client_1 = require("@prisma/client");
var axios_1 = require("axios");
var prisma = new client_1.PrismaClient();
var WeatherService = /** @class */ (function () {
    function WeatherService() {
        this.API_DELAY = 1000; // 1 วินาทีระหว่างการเรียก API
        this.AUTO_FETCH_INTERVAL = 30 * 60 * 1000; // 30 นาที
        this.BATCH_SIZE = 5; // จำนวนจังหวัดที่ประมวลผลพร้อมกัน
        this.MAX_RETRIES = 3; // จำนวนครั้งสูงสุดในการ retry
        this.RETRY_DELAY = 2000; // หน่วงเวลาก่อน retry (milliseconds)
        this.HTTP_TIMEOUT = 10000; // timeout สำหรับ HTTP requests (10 วินาที)
    }
    /**
     * หน่วงเวลาแบบ exponential backoff
     * @param attempt ครั้งที่ของการ retry
     * @returns เวลาหน่วง (milliseconds)
     */
    WeatherService.prototype.calculateBackoffDelay = function (attempt) {
        return Math.min(this.RETRY_DELAY * Math.pow(2, attempt), 10000);
    };
    /**
     * ลองทำงานซ้ำในกรณีที่ผิดพลาด
     * @param operation ฟังก์ชันที่ต้องการทำซ้ำ
     * @param maxRetries จำนวนครั้งสูงสุด
     * @param operationName ชื่อของ operation สำหรับ logging
     * @returns ผลลัพธ์ของ operation
     */
    WeatherService.prototype.withRetry = function (operation, maxRetries, operationName) {
        if (maxRetries === void 0) { maxRetries = this.MAX_RETRIES; }
        if (operationName === void 0) { operationName = 'operation'; }
        return __awaiter(this, void 0, Promise, function () {
            var lastError, _loop_1, this_1, attempt, state_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _loop_1 = function (attempt) {
                            var _a, error_1, delay_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 4]);
                                        _a = {};
                                        return [4 /*yield*/, operation()];
                                    case 1: return [2 /*return*/, (_a.value = _b.sent(), _a)];
                                    case 2:
                                        error_1 = _b.sent();
                                        lastError = error_1;
                                        if (attempt === maxRetries) {
                                            console.error("\u274C " + operationName + " failed after " + (maxRetries + 1) + " attempts:", lastError.message);
                                            throw lastError;
                                        }
                                        delay_1 = this_1.calculateBackoffDelay(attempt);
                                        console.warn("\u26A0\uFE0F  " + operationName + " failed (attempt " + (attempt + 1) + "/" + (maxRetries + 1) + "), retrying in " + delay_1 + "ms...");
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay_1); })];
                                    case 3:
                                        _b.sent();
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        attempt = 0;
                        _a.label = 1;
                    case 1:
                        if (!(attempt <= maxRetries)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _a.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4: throw lastError;
                }
            });
        });
    };
    /**
     * สร้าง HTTP client ที่มี configuration ที่เหมาะสม
     * @returns Axios instance
     */
    WeatherService.prototype.createHttpClient = function () {
        var config = {
            timeout: this.HTTP_TIMEOUT,
            headers: {
                'User-Agent': 'WeatherApp/1.0'
            }
        };
        var client = axios_1["default"].create(config);
        // เพิ่ม response interceptor สำหรับ error handling
        client.interceptors.response.use(function (response) { return response; }, function (error) {
            var _a, _b;
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout');
            }
            if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) >= 500) {
                throw new Error("Server error: " + error.response.status);
            }
            if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 429) {
                throw new Error('Rate limit exceeded');
            }
            throw error;
        });
        return client;
    };
    /**
     * ล้างข้อมูลสภาพอากาศและคุณภาพอากาศเก่า (เฉพาะข้อมูลระดับจังหวัด)
     * @returns จำนวนรายการที่ถูกลบ
     */
    WeatherService.prototype.clearOldWeatherData = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _a, deletedWeather, deletedAqi, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        console.log('🗑️  Clearing old weather data...');
                        return [4 /*yield*/, Promise.all([
                                prisma.weatherData.deleteMany({
                                    where: {
                                        id_place: null // เฉพาะข้อมูล province
                                    }
                                }),
                                prisma.aqiData.deleteMany({
                                    where: {
                                        id_place: null // เฉพาะข้อมูล province
                                    }
                                })
                            ])];
                    case 1:
                        _a = _b.sent(), deletedWeather = _a[0], deletedAqi = _a[1];
                        console.log("\uD83D\uDDD1\uFE0F  Deleted " + deletedWeather.count + " weather records");
                        console.log("\uD83D\uDDD1\uFE0F  Deleted " + deletedAqi.count + " AQI records");
                        return [2 /*return*/, {
                                deletedWeather: deletedWeather.count,
                                deletedAqi: deletedAqi.count
                            }];
                    case 2:
                        error_2 = _b.sent();
                        console.error('❌ Error clearing old weather data:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ดึงและจัดเก็บข้อมูลสภาพอากาศสำหรับจังหวัดทั้งหมด (แบบ batch processing)
     * @param clearOldData ต้องการล้างข้อมูลเก่าก่อนหรือไม่
     * @returns สถิติการประมวลผล
     */
    WeatherService.prototype.fetchAndStoreWeatherData = function (clearOldData) {
        if (clearOldData === void 0) { clearOldData = false; }
        return __awaiter(this, void 0, Promise, function () {
            var startTime, stats, allProvinces, provinces, batches, _loop_2, i, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        stats = {
                            total: 0,
                            successful: 0,
                            failed: 0,
                            duration: 0,
                            errors: []
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        if (!clearOldData) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.clearOldWeatherData()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, prisma.msProvince.findMany()];
                    case 4:
                        allProvinces = _a.sent();
                        provinces = allProvinces.filter(function (province) {
                            return province.latitude !== null &&
                                province.longitude !== null;
                        });
                        stats.total = provinces.length;
                        console.log("\uD83D\uDCCD Found " + provinces.length + " provinces with coordinates");
                        batches = this.chunkArray(provinces, this.BATCH_SIZE);
                        console.log("\uD83D\uDD04 Processing " + batches.length + " batches of " + this.BATCH_SIZE + " provinces each");
                        _loop_2 = function (i) {
                            var batch, batchPromises, batchResults;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        batch = batches[i];
                                        console.log("\uD83D\uDCE6 Processing batch " + (i + 1) + "/" + batches.length + " (" + batch.length + " provinces)");
                                        batchPromises = batch.map(function (province) {
                                            return _this.processProvinceWithErrorHandling(province);
                                        });
                                        return [4 /*yield*/, Promise.allSettled(batchPromises)];
                                    case 1:
                                        batchResults = _a.sent();
                                        // อัพเดทสถิติ
                                        batchResults.forEach(function (result, index) {
                                            if (result.status === 'fulfilled' && result.value.success) {
                                                stats.successful++;
                                            }
                                            else {
                                                stats.failed++;
                                                var error = result.status === 'rejected'
                                                    ? result.reason.message
                                                    : result.value.error;
                                                stats.errors.push(batch[index].name + ": " + error);
                                            }
                                        });
                                        if (!(i < batches.length - 1)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, _this.API_DELAY); })];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        };
                        i = 0;
                        _a.label = 5;
                    case 5:
                        if (!(i < batches.length)) return [3 /*break*/, 8];
                        return [5 /*yield**/, _loop_2(i)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8:
                        stats.duration = Date.now() - startTime;
                        console.log("\uD83C\uDF89 Batch processing completed:");
                        console.log("   \u2705 Successful: " + stats.successful + "/" + stats.total);
                        console.log("   \u274C Failed: " + stats.failed + "/" + stats.total);
                        console.log("   \u23F1\uFE0F  Duration: " + (stats.duration / 1000).toFixed(2) + "s");
                        if (stats.errors.length > 0) {
                            console.log("\u26A0\uFE0F  Errors encountered:");
                            stats.errors.slice(0, 5).forEach(function (error) { return console.log("   \u2022 " + error); });
                            if (stats.errors.length > 5) {
                                console.log("   ... and " + (stats.errors.length - 5) + " more errors");
                            }
                        }
                        return [2 /*return*/, stats];
                    case 9:
                        error_3 = _a.sent();
                        stats.duration = Date.now() - startTime;
                        console.error('❌ Error in batch processing:', error_3);
                        throw error_3;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * แบ่ง array เป็น chunks
     * @param array array ที่ต้องการแบ่ง
     * @param size ขนาดของแต่ละ chunk
     * @returns array ของ chunks
     */
    WeatherService.prototype.chunkArray = function (array, size) {
        var chunks = [];
        for (var i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    };
    /**
     * ประมวลผลจังหวัดเดียวพร้อม error handling
     * @param province ข้อมูลจังหวัด
     * @returns ผลลัพธ์การประมวลผล
     */
    WeatherService.prototype.processProvinceWithErrorHandling = function (province) {
        return __awaiter(this, void 0, Promise, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.processProvince(province)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                province: province.name
                            }];
                    case 2:
                        error_4 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                province: province.name,
                                error: error_4.message
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ประมวลผลจังหวัดเดียว (ดึงและบันทึกข้อมูล)
     * @param province ข้อมูลจังหวัด
     */
    WeatherService.prototype.processProvince = function (province) {
        return __awaiter(this, void 0, Promise, function () {
            var lat, lon, _a, weatherData, aqiData;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        lat = Number(province.latitude);
                        lon = Number(province.longitude);
                        console.log("\uD83C\uDF24\uFE0F  Processing " + province.name + "...");
                        return [4 /*yield*/, Promise.all([
                                this.withRetry(function () { return _this.fetchWeatherData(lat, lon); }, this.MAX_RETRIES, "Weather data for " + province.name),
                                this.withRetry(function () { return _this.fetchAqiData(lat, lon); }, this.MAX_RETRIES, "AQI data for " + province.name)
                            ])];
                    case 1:
                        _a = _b.sent(), weatherData = _a[0], aqiData = _a[1];
                        // บันทึกข้อมูลใน database transaction
                        return [4 /*yield*/, this.saveProvinceDataInTransaction(province, weatherData, aqiData)];
                    case 2:
                        // บันทึกข้อมูลใน database transaction
                        _b.sent();
                        console.log("\u2705 Completed processing " + province.name);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * บันทึกข้อมูลจังหวัดใน database transaction
     * @param province ข้อมูลจังหวัด
     * @param weatherData ข้อมูลสภาพอากาศ
     * @param aqiData ข้อมูลคุณภาพอากาศ
     */
    WeatherService.prototype.saveProvinceDataInTransaction = function (province, weatherData, aqiData) {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c, _d, _e, _f;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        if (!weatherData) return [3 /*break*/, 2];
                                        return [4 /*yield*/, tx.weatherData.create({
                                                data: {
                                                    id_province: province.id_province,
                                                    weather_code: weatherData.current.weather_code,
                                                    temperature_2m: weatherData.current.temperature_2m,
                                                    rain: weatherData.current.rain,
                                                    precipitation: weatherData.current.precipitation,
                                                    apparent_temperature: weatherData.current.apparent_temperature,
                                                    sunrise: weatherData.daily.sunrise[0],
                                                    sunset: weatherData.daily.sunset[0],
                                                    uv_index_max: weatherData.daily.uv_index_max[0],
                                                    rain_sum: weatherData.daily.rain_sum[0],
                                                    precipitation_probability_max: weatherData.daily.precipitation_probability_max[0],
                                                    temperature_2m_min: weatherData.daily.temperature_2m_min[0],
                                                    temperature_2m_max: weatherData.daily.temperature_2m_max[0],
                                                    wind_speed_10m_max: weatherData.daily.wind_speed_10m_max[0]
                                                }
                                            })];
                                    case 1:
                                        _g.sent();
                                        _g.label = 2;
                                    case 2:
                                        if (!aqiData) return [3 /*break*/, 4];
                                        return [4 /*yield*/, tx.aqiData.create({
                                                data: {
                                                    id_province: province.id_province,
                                                    aqi: aqiData.data.aqi,
                                                    pm25: ((_a = aqiData.data.iaqi.pm25) === null || _a === void 0 ? void 0 : _a.v) || null,
                                                    pm10: ((_b = aqiData.data.iaqi.pm10) === null || _b === void 0 ? void 0 : _b.v) || null,
                                                    no2: ((_c = aqiData.data.iaqi.no2) === null || _c === void 0 ? void 0 : _c.v) || null,
                                                    so2: ((_d = aqiData.data.iaqi.so2) === null || _d === void 0 ? void 0 : _d.v) || null,
                                                    o3: ((_e = aqiData.data.iaqi.o3) === null || _e === void 0 ? void 0 : _e.v) || null,
                                                    co: ((_f = aqiData.data.iaqi.co) === null || _f === void 0 ? void 0 : _f.v) || null
                                                }
                                            })];
                                    case 3:
                                        _g.sent();
                                        _g.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ดึงข้อมูลสภาพอากาศสำหรับจังหวัดเฉพาะ
     * @param provinceId ID ของจังหวัด
     * @returns ผลลัพธ์การดึงข้อมูล
     */
    WeatherService.prototype.fetchWeatherForProvince = function (provinceId) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, Promise, function () {
            var province, weatherData, aqiData, results, _g, _h, error_5;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _j.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, prisma.msProvince.findUnique({
                                where: { id_province: provinceId }
                            })];
                    case 1:
                        province = _j.sent();
                        if (!province) {
                            throw new Error("Province with ID " + provinceId + " not found");
                        }
                        if (!province.latitude || !province.longitude) {
                            throw new Error("Province " + province.name + " has no coordinates");
                        }
                        console.log("\uD83C\uDF24\uFE0F  Fetching weather for " + province.name + "...");
                        return [4 /*yield*/, this.fetchWeatherData(Number(province.latitude), Number(province.longitude))];
                    case 2:
                        weatherData = _j.sent();
                        return [4 /*yield*/, this.fetchAqiData(Number(province.latitude), Number(province.longitude))];
                    case 3:
                        aqiData = _j.sent();
                        results = { weather: null, aqi: null };
                        if (!weatherData) return [3 /*break*/, 5];
                        _g = results;
                        return [4 /*yield*/, prisma.weatherData.create({
                                data: {
                                    id_province: province.id_province,
                                    weather_code: weatherData.current.weather_code,
                                    temperature_2m: weatherData.current.temperature_2m,
                                    rain: weatherData.current.rain,
                                    precipitation: weatherData.current.precipitation,
                                    apparent_temperature: weatherData.current.apparent_temperature,
                                    sunrise: weatherData.daily.sunrise[0],
                                    sunset: weatherData.daily.sunset[0],
                                    uv_index_max: weatherData.daily.uv_index_max[0],
                                    rain_sum: weatherData.daily.rain_sum[0],
                                    precipitation_probability_max: weatherData.daily.precipitation_probability_max[0],
                                    temperature_2m_min: weatherData.daily.temperature_2m_min[0],
                                    temperature_2m_max: weatherData.daily.temperature_2m_max[0],
                                    wind_speed_10m_max: weatherData.daily.wind_speed_10m_max[0]
                                }
                            })];
                    case 4:
                        _g.weather = _j.sent();
                        _j.label = 5;
                    case 5:
                        if (!aqiData) return [3 /*break*/, 7];
                        _h = results;
                        return [4 /*yield*/, prisma.aqiData.create({
                                data: {
                                    id_province: province.id_province,
                                    aqi: aqiData.data.aqi,
                                    pm25: ((_a = aqiData.data.iaqi.pm25) === null || _a === void 0 ? void 0 : _a.v) || null,
                                    pm10: ((_b = aqiData.data.iaqi.pm10) === null || _b === void 0 ? void 0 : _b.v) || null,
                                    no2: ((_c = aqiData.data.iaqi.no2) === null || _c === void 0 ? void 0 : _c.v) || null,
                                    so2: ((_d = aqiData.data.iaqi.so2) === null || _d === void 0 ? void 0 : _d.v) || null,
                                    o3: ((_e = aqiData.data.iaqi.o3) === null || _e === void 0 ? void 0 : _e.v) || null,
                                    co: ((_f = aqiData.data.iaqi.co) === null || _f === void 0 ? void 0 : _f.v) || null
                                }
                            })];
                    case 6:
                        _h.aqi = _j.sent();
                        _j.label = 7;
                    case 7: return [2 /*return*/, {
                            success: true,
                            province: province.name,
                            data: results
                        }];
                    case 8:
                        error_5 = _j.sent();
                        console.error("\u274C Error fetching weather for province:", error_5);
                        throw error_5;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ดึงข้อมูลสภาพอากาศจาก Open-Meteo API
     * @param lat ละติจูด
     * @param lon ลองจิจูด
     * @returns ข้อมูลสภาพอากาศ
     */
    WeatherService.prototype.fetchWeatherData = function (lat, lon) {
        return __awaiter(this, void 0, Promise, function () {
            var httpClient, url, response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        httpClient = this.createHttpClient();
                        url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=weather_code,temperature_2m,rain,precipitation,apparent_temperature&daily=sunrise,sunset,uv_index_max,rain_sum,precipitation_probability_max,temperature_2m_min,temperature_2m_max,wind_speed_10m_max&timezone=auto";
                        return [4 /*yield*/, httpClient.get(url)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_6 = _a.sent();
                        console.error("Error fetching weather data for coordinates (" + lat + ", " + lon + "):", error_6.message);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ดึงข้อมูลคุณภาพอากาศจาก AQICN API
     * @param lat ละติจูด
     * @param lon ลองจิจูด
     * @returns ข้อมูลคุณภาพอากาศ
     */
    WeatherService.prototype.fetchAqiData = function (lat, lon) {
        return __awaiter(this, void 0, Promise, function () {
            var aqiToken, httpClient, response, responseData, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        aqiToken = process.env.AQICN_API_TOKEN;
                        if (!aqiToken) {
                            console.warn('⚠️  AQICN API token is not configured - AQI data will be skipped');
                            return [2 /*return*/, null];
                        }
                        httpClient = this.createHttpClient();
                        return [4 /*yield*/, httpClient.get("https://api.waqi.info/feed/geo:" + lat + ";" + lon + "/?token=" + aqiToken)];
                    case 1:
                        response = _a.sent();
                        responseData = response.data;
                        if (responseData.status !== 'ok') {
                            throw new Error("AQI API returned status: " + responseData.status);
                        }
                        return [2 /*return*/, response.data];
                    case 2:
                        error_7 = _a.sent();
                        console.error("Error fetching AQI data for coordinates (" + lat + ", " + lon + "):", error_7.message);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * เริ่มการดึงข้อมูลอัตโนมัติทุก 30 นาที
     */
    WeatherService.prototype.startAutoFetch = function () {
        var _this = this;
        console.log('🕒 Starting automatic weather data fetching every 30 minutes...');
        this.intervalId = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var startTime, stats, duration, successRate, error_8, duration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        console.log('⏰ Auto-fetching weather data started...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.fetchAndStoreWeatherData(true)];
                    case 2:
                        stats = _a.sent();
                        duration = (Date.now() - startTime) / 1000;
                        console.log('✅ Auto-fetch completed successfully');
                        console.log("   \uD83D\uDCCA Statistics: " + stats.successful + "/" + stats.total + " provinces processed");
                        console.log("   \u23F1\uFE0F  Total duration: " + duration.toFixed(2) + "s");
                        successRate = (stats.successful / stats.total) * 100;
                        if (successRate < 80) {
                            console.warn("\u26A0\uFE0F  Low success rate: " + successRate.toFixed(1) + "%");
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_8 = _a.sent();
                        duration = (Date.now() - startTime) / 1000;
                        console.error('❌ Auto-fetch failed:', error_8.message);
                        console.error("   \u23F1\uFE0F  Failed after: " + duration.toFixed(2) + "s");
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }, this.AUTO_FETCH_INTERVAL);
        // Run initial fetch
        console.log('🚀 Running initial data fetch...');
        this.fetchAndStoreWeatherData(true)["catch"](function (error) {
            console.error('❌ Initial fetch failed:', error);
        });
    };
    /**
     * หยุดการดึงข้อมูลอัตโนมัติ
     */
    WeatherService.prototype.stopAutoFetch = function () {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
            console.log('🛑 Stopped automatic weather data fetching');
        }
    };
    /**
     * ตรวจสอบสถานะของระบบ
     * @returns ข้อมูลสถานะของระบบ
     */
    WeatherService.prototype.getSystemHealth = function () {
        return __awaiter(this, void 0, Promise, function () {
            var health, provinceCount, _a, weatherCount, aqiCount, latestWeather, error_9, testLat_1, testLon_1, weatherResponse, error_10, testLat_2, testLon_2, aqiResponse, error_11, serviceCount;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        health = {
                            status: 'healthy',
                            services: {
                                database: false,
                                weatherApi: false,
                                aqiApi: false
                            },
                            lastUpdate: undefined,
                            dataAvailability: {
                                provinces: 0,
                                weatherRecords: 0,
                                aqiRecords: 0
                            }
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, prisma.msProvince.count()];
                    case 2:
                        provinceCount = _b.sent();
                        health.services.database = true;
                        health.dataAvailability.provinces = provinceCount;
                        return [4 /*yield*/, Promise.all([
                                prisma.weatherData.count(),
                                prisma.aqiData.count(),
                                prisma.weatherData.findFirst({
                                    orderBy: { created_at: 'desc' }
                                })
                            ])];
                    case 3:
                        _a = _b.sent(), weatherCount = _a[0], aqiCount = _a[1], latestWeather = _a[2];
                        health.dataAvailability.weatherRecords = weatherCount;
                        health.dataAvailability.aqiRecords = aqiCount;
                        health.lastUpdate = latestWeather === null || latestWeather === void 0 ? void 0 : latestWeather.created_at;
                        return [3 /*break*/, 5];
                    case 4:
                        error_9 = _b.sent();
                        console.error('Database health check failed:', error_9);
                        health.status = 'unhealthy';
                        return [3 /*break*/, 5];
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        testLat_1 = 13.7563;
                        testLon_1 = 100.5018;
                        return [4 /*yield*/, this.withRetry(function () { return _this.fetchWeatherData(testLat_1, testLon_1); }, 1, // single attempt for health check
                            'Weather API health check')];
                    case 6:
                        weatherResponse = _b.sent();
                        health.services.weatherApi = weatherResponse !== null;
                        return [3 /*break*/, 8];
                    case 7:
                        error_10 = _b.sent();
                        console.warn('Weather API health check failed:', error_10.message);
                        return [3 /*break*/, 8];
                    case 8:
                        _b.trys.push([8, 12, , 13]);
                        if (!process.env.AQICN_API_TOKEN) return [3 /*break*/, 10];
                        testLat_2 = 13.7563;
                        testLon_2 = 100.5018;
                        return [4 /*yield*/, this.withRetry(function () { return _this.fetchAqiData(testLat_2, testLon_2); }, 1, // single attempt for health check
                            'AQI API health check')];
                    case 9:
                        aqiResponse = _b.sent();
                        health.services.aqiApi = aqiResponse !== null;
                        return [3 /*break*/, 11];
                    case 10:
                        health.services.aqiApi = false; // No token configured
                        _b.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        error_11 = _b.sent();
                        console.warn('AQI API health check failed:', error_11.message);
                        return [3 /*break*/, 13];
                    case 13:
                        serviceCount = Object.values(health.services).filter(Boolean).length;
                        if (serviceCount === 0) {
                            health.status = 'unhealthy';
                        }
                        else if (serviceCount < 2) {
                            health.status = 'degraded';
                        }
                        return [2 /*return*/, health];
                }
            });
        });
    };
    /**
     * รับสถิติการใช้งานระบบ
     * @returns สถิติต่างๆ ของระบบ
     */
    WeatherService.prototype.getSystemStatistics = function () {
        return __awaiter(this, void 0, Promise, function () {
            var stats, _a, oldestWeather, newestWeather, now, avgAge, _b, totalProvinces, provincesWithWeather, provincesWithAqi, error_12;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        stats = {
                            autoFetchRunning: this.intervalId !== undefined,
                            dataFreshness: {},
                            provinceCoverage: {}
                        };
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, Promise.all([
                                prisma.weatherData.findFirst({
                                    orderBy: { created_at: 'asc' }
                                }),
                                prisma.weatherData.findFirst({
                                    orderBy: { created_at: 'desc' }
                                })
                            ])];
                    case 2:
                        _a = _c.sent(), oldestWeather = _a[0], newestWeather = _a[1];
                        if (oldestWeather && newestWeather) {
                            stats.dataFreshness.oldestRecord = oldestWeather.created_at;
                            stats.dataFreshness.newestRecord = newestWeather.created_at;
                            now = new Date();
                            avgAge = (now.getTime() - newestWeather.created_at.getTime()) / (1000 * 60 * 60);
                            stats.dataFreshness.averageAge = Math.round(avgAge * 100) / 100;
                        }
                        return [4 /*yield*/, Promise.all([
                                prisma.msProvince.count(),
                                prisma.msProvince.count({
                                    where: {
                                        weather_data: {
                                            some: {}
                                        }
                                    }
                                }),
                                prisma.msProvince.count({
                                    where: {
                                        aqi_data: {
                                            some: {}
                                        }
                                    }
                                })
                            ])];
                    case 3:
                        _b = _c.sent(), totalProvinces = _b[0], provincesWithWeather = _b[1], provincesWithAqi = _b[2];
                        stats.provinceCoverage = {
                            total: totalProvinces,
                            withWeatherData: provincesWithWeather,
                            withAqiData: provincesWithAqi,
                            coveragePercentage: Math.round((provincesWithWeather / totalProvinces) * 100)
                        };
                        return [3 /*break*/, 5];
                    case 4:
                        error_12 = _c.sent();
                        console.error('Error getting system statistics:', error_12);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, stats];
                }
            });
        });
    };
    return WeatherService;
}());
exports.WeatherService = WeatherService;
