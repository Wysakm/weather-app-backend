"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const province_controller_1 = require("../controllers/province.controller");
const router = express_1.default.Router();
// GET /api/provinces - Get all provinces
router.get('/', province_controller_1.getAllProvinces);
// GET /api/provinces/paginated - Get provinces with pagination
router.get('/paginated', province_controller_1.getProvincesWithPagination);
// GET /api/provinces/:id - Get province by ID
router.get('/:id', province_controller_1.getProvinceById);
// POST /api/provinces - Create new province
router.post('/', province_controller_1.createProvince);
// PUT /api/provinces/:id - Update province
router.put('/:id', province_controller_1.updateProvince);
// DELETE /api/provinces/:id - Delete province
router.delete('/:id', province_controller_1.deleteProvince);
exports.default = router;
