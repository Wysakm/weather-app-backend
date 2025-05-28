"use strict";
exports.__esModule = true;
var dotenv_1 = require("dotenv");
dotenv_1["default"].config();
var app_1 = require("./app");
var weatherScheduler_1 = require("./scheduler/weatherScheduler");
var PORT = process.env.PORT || 3000;
// เริ่ม scheduler
weatherScheduler_1.startWeatherScheduler();
app_1["default"].listen(PORT, function () {
    console.log("\uD83D\uDE80 Server is running on http://localhost:" + PORT);
    console.log("\uD83D\uDCDD API Documentation: http://localhost:" + PORT + "/api-docs");
});
