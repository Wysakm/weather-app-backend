"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePlaceUpdate = exports.validatePlace = void 0;
const express_1 = require("express");
const placeController_1 = require("../controllers/placeController");
const router = (0, express_1.Router)();
const placeController = new placeController_1.PlaceController();
// Validation middleware
const validatePlace = (req, res, next) => {
    const { name_place, latitude, longitude, place_type_id, gg_ref } = req.body;
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
    if (!place_type_id || typeof place_type_id !== 'string') {
        res.status(400).json({ error: 'Type name is required' });
        return;
    }
    // Optional: Validate gg_ref if provided
    if (gg_ref && typeof gg_ref !== 'string') {
        res.status(400).json({ error: 'Google reference must be a string' });
        return;
    }
    next();
};
exports.validatePlace = validatePlace;
const validatePlaceUpdate = (req, res, next) => {
    const { name_place, latitude, longitude } = req.body;
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
exports.validatePlaceUpdate = validatePlaceUpdate;
// Routes
router.post('/', exports.validatePlace, placeController.createPlace);
router.post('/google', placeController.createPlaceFromGoogle);
router.get('/', placeController.getAllPlaces);
router.get('/nearby', placeController.getNearbyPlaces);
router.get('/check-google/:google_place_id', placeController.checkGooglePlace);
router.get('/:id', placeController.getPlaceById);
router.put('/:id', exports.validatePlaceUpdate, placeController.updatePlace);
router.delete('/:id', placeController.deletePlace);
exports.default = router;
