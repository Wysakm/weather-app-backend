import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { placeController } from '../controllers/placeController';

// Validation middleware
export const validatePlace = (req: Request, res: Response, next: NextFunction): void => {
  const { name_place, latitude, longitude, type_name, province_name } = req.body;
  
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

// Router setup
const router = Router();

// Routes
router.get('/nearby', placeController.getNearbyPlaces);
router.post('/', authenticateToken, validatePlace, placeController.createPlace);
router.get('/', placeController.getAllPlaces);
router.get('/:id', placeController.getPlaceById);
router.put('/:id', authenticateToken, validatePlaceUpdate, placeController.updatePlace);
router.delete('/:id', authenticateToken, placeController.deletePlace);

export default router;