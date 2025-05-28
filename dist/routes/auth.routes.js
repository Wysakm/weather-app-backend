"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', auth_controller_1.AuthController.register);
router.post('/login', passport_1.default.authenticate('local', { session: false }), auth_controller_1.AuthController.login);
// Password reset routes
router.post('/forgot-password', auth_controller_1.AuthController.forgotPassword);
router.post('/reset-password', auth_controller_1.AuthController.resetPassword);
router.post('/verify-reset-token', auth_controller_1.AuthController.verifyResetToken);
// Token verification route
router.post('/verify', auth_controller_1.AuthController.verifyToken);
// Protected routes
router.get('/me', passport_1.default.authenticate('jwt', { session: false }), auth_controller_1.AuthController.getMe);
router.post('/change-password', passport_1.default.authenticate('jwt', { session: false }), auth_controller_1.AuthController.changePassword);
exports.default = router;
