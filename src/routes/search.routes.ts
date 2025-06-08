import { Router } from 'express';
import { SearchController } from '../controllers/searchController';

const router = Router();
const searchController = new SearchController();

// Search locations by name, province, or place type
router.get('/locations', searchController.searchLocations);

// Search provinces by weather conditions and AQI
router.get('/weather', searchController.searchByWeather);

// Get search suggestions for autocomplete
router.get('/suggestions', searchController.getSuggestions);

// Advanced search combining location and weather filters
router.get('/advanced', searchController.advancedSearch);

export default router;
