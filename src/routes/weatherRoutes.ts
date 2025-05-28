import { Router } from 'express';
import { weatherController } from '../controllers/weatherController';

const router = Router();

// Weather routes
router.get('/', weatherController.getAllWeatherData);
router.get('/place/:placeId', weatherController.getWeatherByPlace);
router.get('/province/:provinceId', weatherController.getWeatherByProvince);
router.get('/latest', weatherController.getLatestWeatherData);

// Manual trigger for fetching weather data
router.post('/fetch', weatherController.fetchAndStoreWeatherData);
router.post('/fetch/province/:provinceId', weatherController.fetchWeatherForProvince);

// Enhanced batch processing endpoint
router.post('/update-batch', weatherController.updateWeatherDataBatch);

// System monitoring routes
router.get('/health', weatherController.getSystemHealth);
router.get('/statistics', weatherController.getSystemStatistics);

// Data management routes
router.delete('/clear', weatherController.clearWeatherData);
router.post('/refresh', weatherController.refreshWeatherData);

export default router;