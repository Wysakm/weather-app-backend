"use strict";

var express = require('express');

var router = express.Router();

var _require = require('../controllers/provinceController'),
    getAllProvinces = _require.getAllProvinces,
    getProvinceById = _require.getProvinceById,
    createProvince = _require.createProvince,
    updateProvince = _require.updateProvince,
    deleteProvince = _require.deleteProvince,
    getProvincesWithPagination = _require.getProvincesWithPagination; // GET /api/provinces - Get all provinces


router.get('/', getAllProvinces); // GET /api/provinces/paginated - Get provinces with pagination

router.get('/paginated', getProvincesWithPagination); // GET /api/provinces/:id - Get province by ID

router.get('/:id', getProvinceById); // POST /api/provinces - Create new province

router.post('/', createProvince); // PUT /api/provinces/:id - Update province

router.put('/:id', updateProvince); // DELETE /api/provinces/:id - Delete province

router["delete"]('/:id', deleteProvince);
module.exports = router;