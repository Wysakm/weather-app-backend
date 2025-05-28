import { Router } from 'express';
import { aqiController } from '../controllers/aqiController';

const router = Router();

// AQI routes
router.get('/', aqiController.getAllAqiData);
router.get('/place/:placeId', aqiController.getAqiByPlace);
router.get('/latest', aqiController.getLatestAqiData);
router.get('/quality/:level', aqiController.getAqiByQualityLevel);

export default router;