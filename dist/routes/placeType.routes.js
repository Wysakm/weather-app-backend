"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const placeType_controller_1 = require("../controllers/placeType.controller");
const router = (0, express_1.Router)();
// Public routes
router.get('/', placeType_controller_1.PlaceTypeController.getAllPlaceTypes);
router.get('/:id', placeType_controller_1.PlaceTypeController.getPlaceTypeById);
// Protected routes (Admin/Moderator only)
router.post('/', passport_1.default.authenticate('jwt', { session: false }), placeType_controller_1.PlaceTypeController.createPlaceType);
router.put('/:id', passport_1.default.authenticate('jwt', { session: false }), placeType_controller_1.PlaceTypeController.updatePlaceType);
router.delete('/:id', passport_1.default.authenticate('jwt', { session: false }), placeType_controller_1.PlaceTypeController.deletePlaceType);
exports.default = router;
