"use strict";
exports.__esModule = true;
var express_1 = require("express");
var aqiController_1 = require("../controllers/aqiController");
var router = express_1.Router();
// AQI routes
router.get('/', aqiController_1.aqiController.getAllAqiData);
router.get('/place/:placeId', aqiController_1.aqiController.getAqiByPlace);
router.get('/latest', aqiController_1.aqiController.getLatestAqiData);
router.get('/quality/:level', aqiController_1.aqiController.getAqiByQualityLevel);
exports["default"] = router;
