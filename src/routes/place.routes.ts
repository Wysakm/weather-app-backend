import { Router } from 'express';
import { PlaceController } from '../controllers/placeController';
import { validatePlace, validatePlaceUpdate } from '../middleware/placeValidation';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const placeController = new PlaceController();

// Public routes
router.get('/', placeController.getAllPlaces);
router.get('/nearby', placeController.getNearbyPlaces);
router.get('/:id', placeController.getPlaceById);

// Protected routes (require authentication)
router.post('/', authenticateToken, validatePlace, placeController.createPlace);
router.put('/:id', authenticateToken, validatePlaceUpdate, placeController.updatePlace);
router.delete('/:id', authenticateToken, placeController.deletePlace);

export default router;