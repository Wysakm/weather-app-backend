import express from 'express';
import {
  getAllProvinces,
  getProvinceById,
  createProvince,
  updateProvince,
  deleteProvince,
  getProvincesWithPagination
} from '../controllers/province.controller';

const router = express.Router();

// GET /api/provinces - Get all provinces
router.get('/', getAllProvinces);

// GET /api/provinces/paginated - Get provinces with pagination
router.get('/paginated', getProvincesWithPagination);

// GET /api/provinces/:id - Get province by ID
router.get('/:id', getProvinceById);

// POST /api/provinces - Create new province
router.post('/', createProvince);

// PUT /api/provinces/:id - Update province
router.put('/:id', updateProvince);

// DELETE /api/provinces/:id - Delete province
router.delete('/:id', deleteProvince);

export default router;