"use strict";
exports.__esModule = true;
var express_1 = require("express");
var cors_1 = require("cors");
var passport_config_1 = require("./config/passport.config");
var auth_routes_1 = require("./routes/auth.routes");
var placeType_routes_1 = require("./routes/placeType.routes");
var place_routes_1 = require("./routes/place.routes"); // เพิ่ม import นี้
var error_middleware_1 = require("./middleware/error.middleware");
var dotenv_1 = require("dotenv");
dotenv_1["default"].config();
var app = express_1["default"]();
// Middleware
app.use(cors_1["default"]());
app.use(express_1["default"].json());
app.use(express_1["default"].urlencoded({ extended: true }));
app.use(passport_config_1["default"].initialize());
// Routes
app.use('/api/auth', auth_routes_1["default"]);
app.use('/api/place-types', placeType_routes_1["default"]);
app.use('/api/places', place_routes_1["default"]); // เพิ่มบรรทัดนี้
// Health check
app.get('/health', function (req, res) {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error handling
app.use(error_middleware_1.errorHandler);
exports["default"] = app;
