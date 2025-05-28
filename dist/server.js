"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const weatherScheduler_1 = require("./scheduler/weatherScheduler");
const PORT = process.env.PORT || 3000;
app_1.default.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/api/places`);
    console.log(`📊 Health Check: http://localhost:${PORT}/api/weather/health`);
    console.log(`📈 Statistics: http://localhost:${PORT}/api/weather/statistics`);
    // เริ่ม optimized weather scheduler (ใช้ตัวเดียวแทนของเดิม 3 ตัว)
    (0, weatherScheduler_1.startWeatherScheduler)();
    console.log('✅ Server is running with optimized automatic weather fetching');
});
