"use strict";
exports.__esModule = true;
exports.validatePlaceUpdate = exports.validatePlace = void 0;
var express_1 = require("express");
var auth_middleware_1 = require("../middleware/auth.middleware");
var placeController_1 = require("../controllers/placeController");
// Validation middleware
exports.validatePlace = function (req, res, next) {
    var _a = req.body, name_place = _a.name_place, latitude = _a.latitude, longitude = _a.longitude, type_name = _a.type_name, province_name = _a.province_name;
    if (!name_place || typeof name_place !== 'string') {
        res.status(400).json({ error: 'Name is required and must be a string' });
        return;
    }
    if (!latitude || typeof latitude !== 'number') {
        res.status(400).json({ error: 'Latitude is required and must be a number' });
        return;
    }
    if (!longitude || typeof longitude !== 'number') {
        res.status(400).json({ error: 'Longitude is required and must be a number' });
        return;
    }
    if (!type_name || typeof type_name !== 'string') {
        res.status(400).json({ error: 'Type name is required' });
        return;
    }
    if (!province_name || typeof province_name !== 'string') {
        res.status(400).json({ error: 'Province name is required' });
        return;
    }
    next();
};
exports.validatePlaceUpdate = function (req, res, next) {
    var _a = req.body, name_place = _a.name_place, latitude = _a.latitude, longitude = _a.longitude;
    if (name_place !== undefined && typeof name_place !== 'string') {
        res.status(400).json({ error: 'Name must be a string' });
        return;
    }
    if (latitude !== undefined && typeof latitude !== 'number') {
        res.status(400).json({ error: 'Latitude must be a number' });
        return;
    }
    if (longitude !== undefined && typeof longitude !== 'number') {
        res.status(400).json({ error: 'Longitude must be a number' });
        return;
    }
    next();
};
// Router setup
var router = express_1.Router();
// Routes
router.get('/nearby', placeController_1.placeController.getNearbyPlaces);
router.post('/', auth_middleware_1.authenticateToken, exports.validatePlace, placeController_1.placeController.createPlace);
router.get('/', placeController_1.placeController.getAllPlaces);
router.get('/:id', placeController_1.placeController.getPlaceById);
router.put('/:id', auth_middleware_1.authenticateToken, exports.validatePlaceUpdate, placeController_1.placeController.updatePlace);
router["delete"]('/:id', auth_middleware_1.authenticateToken, placeController_1.placeController.deletePlace);
exports["default"] = router;
