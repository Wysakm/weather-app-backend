"use strict";
exports.__esModule = true;
var dotenv_1 = require("dotenv");
dotenv_1["default"].config();
var app_1 = require("./app");
var weatherScheduler_1 = require("./scheduler/weatherScheduler");
var PORT = process.env.PORT || 3000;
app_1["default"].listen(PORT, function () {
    console.log("\uD83D\uDE80 Server running on port " + PORT);
    console.log("\uD83D\uDCDD API Documentation: http://localhost:" + PORT + "/api/places");
    console.log("\uD83D\uDCCA Health Check: http://localhost:" + PORT + "/api/weather/health");
    console.log("\uD83D\uDCC8 Statistics: http://localhost:" + PORT + "/api/weather/statistics");
    // เริ่ม optimized weather scheduler (ใช้ตัวเดียวแทนของเดิม 3 ตัว)
    weatherScheduler_1.startWeatherScheduler();
    console.log('✅ Server is running with optimized automatic weather fetching');
});
