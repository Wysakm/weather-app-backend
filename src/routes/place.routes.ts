import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { PlaceController } from '../controllers/placeController';

const router = Router();
const placeController = new PlaceController();

// Validation middleware
export const validatePlace = (req: Request, res: Response, next: NextFunction): void => {
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

export const validatePlaceUpdate = (req: Request, res: Response, next: NextFunction): void => {
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

// Routes
router.post('/', validatePlace, placeController.createPlace);
router.post('/google', placeController.createPlaceFromGoogle);
router.get('/', placeController.getAllPlaces);
router.get('/nearby', placeController.getNearbyPlaces);
router.get('/check-google/:google_place_id', placeController.checkGooglePlace);
router.get('/:id', placeController.getPlaceById);
router.put('/:id', validatePlaceUpdate, placeController.updatePlace);
router.delete('/:id', placeController.deletePlace);

export default router;