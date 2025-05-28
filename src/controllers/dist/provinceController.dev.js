"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _require = require('@prisma/client'),
    PrismaClient = _require.PrismaClient;

var prisma = new PrismaClient(); // Get all provinces

var getAllProvinces = function getAllProvinces(req, res) {
  var provinces;
  return regeneratorRuntime.async(function getAllProvinces$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(prisma.msProvince.findMany({
            include: {
              places: true,
              weather_data: true,
              aqi_data: true,
              _count: {
                select: {
                  places: true,
                  weather_data: true,
                  aqi_data: true
                }
              }
            }
          }));

        case 3:
          provinces = _context.sent;
          res.status(200).json({
            success: true,
            data: provinces
          });
          _context.next = 10;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          res.status(500).json({
            success: false,
            message: 'Failed to fetch provinces',
            error: _context.t0.message
          });

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}; // Get province by ID


var getProvinceById = function getProvinceById(req, res) {
  var id, province;
  return regeneratorRuntime.async(function getProvinceById$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          id = req.params.id;
          _context2.next = 4;
          return regeneratorRuntime.awrap(prisma.msProvince.findUnique({
            where: {
              id_province: id
            },
            include: {
              places: true,
              weather_data: {
                orderBy: {
                  recorded_at: 'desc'
                },
                take: 10
              },
              aqi_data: {
                orderBy: {
                  recorded_at: 'desc'
                },
                take: 10
              }
            }
          }));

        case 4:
          province = _context2.sent;

          if (province) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("return", res.status(404).json({
            success: false,
            message: 'Province not found'
          }));

        case 7:
          res.status(200).json({
            success: true,
            data: province
          });
          _context2.next = 13;
          break;

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](0);
          res.status(500).json({
            success: false,
            message: 'Failed to fetch province',
            error: _context2.t0.message
          });

        case 13:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 10]]);
}; // Create new province


var createProvince = function createProvince(req, res) {
  var _req$body, province_name, latitude, longitude, newProvince;

  return regeneratorRuntime.async(function createProvince$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _req$body = req.body, province_name = _req$body.province_name, latitude = _req$body.latitude, longitude = _req$body.longitude; // Validate required fields

          if (!(!province_name || !latitude || !longitude)) {
            _context3.next = 4;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            success: false,
            message: 'Province name, latitude, and longitude are required'
          }));

        case 4:
          _context3.next = 6;
          return regeneratorRuntime.awrap(prisma.msProvince.create({
            data: {
              province_name: province_name,
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude)
            }
          }));

        case 6:
          newProvince = _context3.sent;
          res.status(201).json({
            success: true,
            message: 'Province created successfully',
            data: newProvince
          });
          _context3.next = 13;
          break;

        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](0);
          res.status(500).json({
            success: false,
            message: 'Failed to create province',
            error: _context3.t0.message
          });

        case 13:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 10]]);
}; // Update province


var updateProvince = function updateProvince(req, res) {
  var id, _req$body2, province_name, latitude, longitude, existingProvince, updateData, updatedProvince;

  return regeneratorRuntime.async(function updateProvince$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          id = req.params.id;
          _req$body2 = req.body, province_name = _req$body2.province_name, latitude = _req$body2.latitude, longitude = _req$body2.longitude; // Check if province exists

          _context4.next = 5;
          return regeneratorRuntime.awrap(prisma.msProvince.findUnique({
            where: {
              id_province: id
            }
          }));

        case 5:
          existingProvince = _context4.sent;

          if (existingProvince) {
            _context4.next = 8;
            break;
          }

          return _context4.abrupt("return", res.status(404).json({
            success: false,
            message: 'Province not found'
          }));

        case 8:
          updateData = {};
          if (province_name) updateData.province_name = province_name;
          if (latitude) updateData.latitude = parseFloat(latitude);
          if (longitude) updateData.longitude = parseFloat(longitude);
          _context4.next = 14;
          return regeneratorRuntime.awrap(prisma.msProvince.update({
            where: {
              id_province: id
            },
            data: updateData
          }));

        case 14:
          updatedProvince = _context4.sent;
          res.status(200).json({
            success: true,
            message: 'Province updated successfully',
            data: updatedProvince
          });
          _context4.next = 21;
          break;

        case 18:
          _context4.prev = 18;
          _context4.t0 = _context4["catch"](0);
          res.status(500).json({
            success: false,
            message: 'Failed to update province',
            error: _context4.t0.message
          });

        case 21:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 18]]);
}; // Delete province


var deleteProvince = function deleteProvince(req, res) {
  var id, existingProvince;
  return regeneratorRuntime.async(function deleteProvince$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          id = req.params.id; // Check if province exists

          _context5.next = 4;
          return regeneratorRuntime.awrap(prisma.msProvince.findUnique({
            where: {
              id_province: id
            },
            include: {
              places: true,
              weather_data: true,
              aqi_data: true
            }
          }));

        case 4:
          existingProvince = _context5.sent;

          if (existingProvince) {
            _context5.next = 7;
            break;
          }

          return _context5.abrupt("return", res.status(404).json({
            success: false,
            message: 'Province not found'
          }));

        case 7:
          if (!(existingProvince.places.length > 0 || existingProvince.weather_data.length > 0 || existingProvince.aqi_data.length > 0)) {
            _context5.next = 9;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            success: false,
            message: 'Cannot delete province with existing places, weather data, or AQI data'
          }));

        case 9:
          _context5.next = 11;
          return regeneratorRuntime.awrap(prisma.msProvince["delete"]({
            where: {
              id_province: id
            }
          }));

        case 11:
          res.status(200).json({
            success: true,
            message: 'Province deleted successfully'
          });
          _context5.next = 17;
          break;

        case 14:
          _context5.prev = 14;
          _context5.t0 = _context5["catch"](0);
          res.status(500).json({
            success: false,
            message: 'Failed to delete province',
            error: _context5.t0.message
          });

        case 17:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 14]]);
}; // Get provinces with pagination


var getProvincesWithPagination = function getProvincesWithPagination(req, res) {
  var _req$query, _req$query$page, page, _req$query$limit, limit, search, skip, where, _ref, _ref2, provinces, total;

  return regeneratorRuntime.async(function getProvincesWithPagination$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _req$query = req.query, _req$query$page = _req$query.page, page = _req$query$page === void 0 ? 1 : _req$query$page, _req$query$limit = _req$query.limit, limit = _req$query$limit === void 0 ? 10 : _req$query$limit, search = _req$query.search;
          skip = (parseInt(page) - 1) * parseInt(limit);
          where = search ? {
            province_name: {
              contains: search,
              mode: 'insensitive'
            }
          } : {};
          _context6.next = 6;
          return regeneratorRuntime.awrap(Promise.all([prisma.msProvince.findMany({
            where: where,
            skip: skip,
            take: parseInt(limit),
            include: {
              _count: {
                select: {
                  places: true,
                  weather_data: true,
                  aqi_data: true
                }
              }
            }
          }), prisma.msProvince.count({
            where: where
          })]));

        case 6:
          _ref = _context6.sent;
          _ref2 = _slicedToArray(_ref, 2);
          provinces = _ref2[0];
          total = _ref2[1];
          res.status(200).json({
            success: true,
            data: provinces,
            pagination: {
              total: total,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: Math.ceil(total / parseInt(limit))
            }
          });
          _context6.next = 16;
          break;

        case 13:
          _context6.prev = 13;
          _context6.t0 = _context6["catch"](0);
          res.status(500).json({
            success: false,
            message: 'Failed to fetch provinces',
            error: _context6.t0.message
          });

        case 16:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 13]]);
};

module.exports = {
  getAllProvinces: getAllProvinces,
  getProvinceById: getProvinceById,
  createProvince: createProvince,
  updateProvince: updateProvince,
  deleteProvince: deleteProvince,
  getProvincesWithPagination: getProvincesWithPagination
};