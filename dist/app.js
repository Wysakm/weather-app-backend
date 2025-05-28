"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const passport_config_1 = __importDefault(require("./config/passport.config"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const placeType_routes_1 = __importDefault(require("./routes/placeType.routes"));
const place_routes_1 = __importDefault(require("./routes/place.routes"));
const weatherRoutes_1 = __importDefault(require("./routes/weatherRoutes"));
const aqiRoutes_1 = __importDefault(require("./routes/aqiRoutes"));
const error_middleware_1 = require("./middleware/error.middleware");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(passport_config_1.default.initialize());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/place-types', placeType_routes_1.default);
app.use('/api/places', place_routes_1.default);
app.use('/api/weather', weatherRoutes_1.default);
app.use('/api/aqi', aqiRoutes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error handling
app.use(error_middleware_1.errorHandler);
exports.default = app;
