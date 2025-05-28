"use strict";
exports.__esModule = true;
var dotenv_1 = require("dotenv");
dotenv_1["default"].config();
var app_1 = require("./app");
var weatherCron_1 = require("./jobs/weatherCron");
var weatherService_1 = require("./services/weatherService");
var PORT = process.env.PORT || 3000;
app_1["default"].listen(PORT, function () {
    console.log("\uD83D\uDE80 Server running on port " + PORT);
    console.log("\uD83D\uDCDD API Documentation: http://localhost:" + PORT + "/api/places");
    // เริ่ม weather cron job
    weatherCron_1.startWeatherCron();
    // เริ่ม auto fetch หลังจาก server รัน
    var weatherService = new weatherService_1.WeatherService();
    weatherService.startAutoFetch();
    console.log('Server is running with automatic weather fetching every 30 minutes');
});
