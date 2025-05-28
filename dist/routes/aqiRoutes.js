"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aqiController_1 = require("../controllers/aqiController");
const router = (0, express_1.Router)();
// AQI routes
router.get('/', aqiController_1.aqiController.getAllAqiData);
router.get('/place/:placeId', aqiController_1.aqiController.getAqiByPlace);
router.get('/latest', aqiController_1.aqiController.getLatestAqiData);
router.get('/quality/:level', aqiController_1.aqiController.getAqiByQualityLevel);
exports.default = router;
