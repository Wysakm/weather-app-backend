"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.PlaceTypeController = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var PlaceTypeController = /** @class */ (function () {
    function PlaceTypeController() {
    }
    // GET /api/place-types - Get all place types
    PlaceTypeController.getAllPlaceTypes = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var placeTypes, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, prisma.placeType.findMany({
                                include: {
                                    _count: {
                                        select: { places: true }
                                    }
                                },
                                orderBy: {
                                    type_name: 'asc'
                                }
                            })];
                    case 1:
                        placeTypes = _a.sent();
                        res.status(200).json({
                            success: true,
                            data: placeTypes
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        res.status(500).json({
                            success: false,
                            error: 'Failed to fetch place types',
                            details: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // GET /api/place-types/:id - Get place type by ID
    PlaceTypeController.getPlaceTypeById = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, placeType, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, prisma.placeType.findUnique({
                                where: { id_place_type: id },
                                include: {
                                    places: {
                                        select: {
                                            id_place: true,
                                            name_place: true,
                                            latitude: true,
                                            longitude: true,
                                            province: {
                                                select: {
                                                    name: true // เปลี่ยนจาก province_name เป็น name
                                                }
                                            }
                                        }
                                    }
                                }
                            })];
                    case 1:
                        placeType = _a.sent();
                        if (!placeType) {
                            res.status(404).json({
                                success: false,
                                error: 'Place type not found'
                            });
                            return [2 /*return*/];
                        }
                        res.status(200).json({
                            success: true,
                            data: placeType
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        res.status(500).json({
                            success: false,
                            error: 'Failed to fetch place type',
                            details: error_2 instanceof Error ? error_2.message : 'Unknown error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // POST /api/place-types - Create new place type
    PlaceTypeController.createPlaceType = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var type_name, existingPlaceType, placeType, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        type_name = req.body.type_name;
                        if (!type_name || typeof type_name !== 'string') {
                            res.status(400).json({
                                success: false,
                                error: 'type_name is required and must be a string'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.placeType.findFirst({
                                where: {
                                    type_name: {
                                        equals: type_name,
                                        mode: 'insensitive'
                                    }
                                }
                            })];
                    case 1:
                        existingPlaceType = _a.sent();
                        if (existingPlaceType) {
                            res.status(409).json({
                                success: false,
                                error: 'Place type with this name already exists'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.placeType.create({
                                data: {
                                    type_name: type_name.trim()
                                }
                            })];
                    case 2:
                        placeType = _a.sent();
                        res.status(201).json({
                            success: true,
                            data: placeType
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        res.status(500).json({
                            success: false,
                            error: 'Failed to create place type',
                            details: error_3 instanceof Error ? error_3.message : 'Unknown error'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // PUT /api/place-types/:id - Update place type
    PlaceTypeController.updatePlaceType = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, type_name, existingPlaceType, placeType, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        type_name = req.body.type_name;
                        if (!type_name || typeof type_name !== 'string') {
                            res.status(400).json({
                                success: false,
                                error: 'type_name is required and must be a string'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.placeType.findFirst({
                                where: {
                                    type_name: {
                                        equals: type_name,
                                        mode: 'insensitive'
                                    },
                                    NOT: {
                                        id_place_type: id
                                    }
                                }
                            })];
                    case 1:
                        existingPlaceType = _a.sent();
                        if (existingPlaceType) {
                            res.status(409).json({
                                success: false,
                                error: 'Place type with this name already exists'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.placeType.update({
                                where: { id_place_type: id },
                                data: { type_name: type_name.trim() }
                            })];
                    case 2:
                        placeType = _a.sent();
                        res.status(200).json({
                            success: true,
                            data: placeType
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        if (error_4.code === 'P2025') {
                            res.status(404).json({
                                success: false,
                                error: 'Place type not found'
                            });
                            return [2 /*return*/];
                        }
                        res.status(500).json({
                            success: false,
                            error: 'Failed to update place type',
                            details: error_4 instanceof Error ? error_4.message : 'Unknown error'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // DELETE /api/place-types/:id - Delete place type
    PlaceTypeController.deletePlaceType = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, placeCount, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        return [4 /*yield*/, prisma.place.count({
                                where: { place_type_id: id }
                            })];
                    case 1:
                        placeCount = _a.sent();
                        if (placeCount > 0) {
                            res.status(400).json({
                                success: false,
                                error: "Cannot delete place type with " + placeCount + " associated places"
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.placeType["delete"]({
                                where: { id_place_type: id }
                            })];
                    case 2:
                        _a.sent();
                        res.status(200).json({
                            success: true,
                            message: 'Place type deleted successfully'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        if (error_5.code === 'P2025') {
                            res.status(404).json({
                                success: false,
                                error: 'Place type not found'
                            });
                            return [2 /*return*/];
                        }
                        res.status(500).json({
                            success: false,
                            error: 'Failed to delete place type',
                            details: error_5 instanceof Error ? error_5.message : 'Unknown error'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return PlaceTypeController;
}());
exports.PlaceTypeController = PlaceTypeController;
