import { Router } from 'express';
import passport from 'passport';
import { PlaceTypeController } from '../controllers/placeType.controller';

const router = Router();

// Public routes
router.get('/', PlaceTypeController.getAllPlaceTypes);
router.get('/:id', PlaceTypeController.getPlaceTypeById);

// Protected routes (Admin/Moderator only)
router.post('/', passport.authenticate('jwt', { session: false }), PlaceTypeController.createPlaceType);
router.put('/:id', passport.authenticate('jwt', { session: false }), PlaceTypeController.updatePlaceType);
router.delete('/:id', passport.authenticate('jwt', { session: false }), PlaceTypeController.deletePlaceType);

export default router;