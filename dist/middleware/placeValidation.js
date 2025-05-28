"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePlaceUpdate = exports.validatePlace = void 0;
const joi_1 = __importDefault(require("joi"));
const placeSchema = joi_1.default.object({
    gg_ref: joi_1.default.string().optional().allow(null),
    name_place: joi_1.default.string().required().max(255),
    place_type_id: joi_1.default.string().uuid().required(),
    latitude: joi_1.default.number().min(-90).max(90).required(),
    longitude: joi_1.default.number().min(-180).max(180).required(),
    province_id: joi_1.default.string().uuid().required(),
    district: joi_1.default.string().optional().allow(null).max(255),
    sub_district: joi_1.default.string().optional().allow(null).max(255),
    place_image: joi_1.default.string().uri().optional().allow(null)
});
const placeUpdateSchema = joi_1.default.object({
    gg_ref: joi_1.default.string().optional().allow(null),
    name_place: joi_1.default.string().optional().max(255),
    place_type_id: joi_1.default.string().uuid().optional(),
    latitude: joi_1.default.number().min(-90).max(90).optional(),
    longitude: joi_1.default.number().min(-180).max(180).optional(),
    province_id: joi_1.default.string().uuid().optional(),
    district: joi_1.default.string().optional().allow(null).max(255),
    sub_district: joi_1.default.string().optional().allow(null).max(255),
    place_image: joi_1.default.string().uri().optional().allow(null)
});
const validatePlace = (req, res, next) => {
    const { error } = placeSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
        });
    }
    next();
};
exports.validatePlace = validatePlace;
const validatePlaceUpdate = (req, res, next) => {
    const { error } = placeUpdateSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
        });
    }
    next();
};
exports.validatePlaceUpdate = validatePlaceUpdate;
