"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const weatherController_1 = require("../controllers/weatherController");
const router = (0, express_1.Router)();
// Weather routes
router.get('/', weatherController_1.weatherController.getAllWeatherData);
router.get('/place/:placeId', weatherController_1.weatherController.getWeatherByPlace);
router.get('/province/:provinceId', weatherController_1.weatherController.getWeatherByProvince);
router.get('/latest', weatherController_1.weatherController.getLatestWeatherData);
// Manual trigger for fetching weather data
router.post('/fetch', weatherController_1.weatherController.fetchAndStoreWeatherData);
router.post('/fetch/province/:provinceId', weatherController_1.weatherController.fetchWeatherForProvince);
// Enhanced batch processing endpoint
router.post('/update-batch', weatherController_1.weatherController.updateWeatherDataBatch);
// System monitoring routes
router.get('/health', weatherController_1.weatherController.getSystemHealth);
router.get('/statistics', weatherController_1.weatherController.getSystemStatistics);
// Data management routes
router.delete('/clear', weatherController_1.weatherController.clearWeatherData);
router.post('/refresh', weatherController_1.weatherController.refreshWeatherData);
exports.default = router;
