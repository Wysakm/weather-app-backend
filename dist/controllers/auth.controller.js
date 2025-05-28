"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    // Register
    static async register(req, res, next) {
        try {
            const { email, password, username, role } = req.body;
            // Validate input
            if (!email || !password || !username) {
                // return res.status(400).json({
                //   success: false,
                //   message: 'Email and password are required'
                // });
                next({
                    success: false,
                    message: 'Email and password are required'
                });
            }
            const result = await auth_service_1.AuthService.register(email, password, username, role);
            res.status(201).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Login
    static async login(req, res, next) {
        try {
            const { user, token } = req.user;
            res.json({
                success: true,
                data: { user, token }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get current user
    static async getMe(req, res, next) {
        res.json({
            success: true,
            data: { user: req.user }
        });
    }
    // Forgot password
    static async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            await auth_service_1.AuthService.forgotPassword(email);
            res.status(200).json({ message: 'Password reset email sent' });
        }
        catch (error) {
            next(error);
        }
    }
    // Reset password
    static async resetPassword(req, res, next) {
        try {
            const { token, newPassword } = req.body;
            await auth_service_1.AuthService.resetPassword(token, newPassword);
            res.status(200).json({ message: 'Password reset successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    // Verify reset token
    static async verifyResetToken(req, res, next) {
        try {
            const { token } = req.body;
            const isValid = await auth_service_1.AuthService.verifyResetToken(token);
            res.status(200).json({ valid: isValid });
        }
        catch (error) {
            next(error);
        }
    }
    // Change password
    static async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id_user;
            await auth_service_1.AuthService.changePassword(userId, currentPassword, newPassword);
            res.status(200).json({ message: 'Password changed successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    // Verify JWT token
    static async verifyToken(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(400).json({
                    success: false,
                    message: 'Authorization header with Bearer token is required'
                });
                return;
            }
            // Extract token from "Bearer <token>"
            const token = authHeader.substring(7);
            if (!token) {
                res.status(400).json({
                    success: false,
                    message: 'Token is required'
                });
                return;
            }
            const result = await auth_service_1.AuthService.verifyToken(token);
            res.status(200).json({
                success: true,
                message: 'Token is valid',
                data: result
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    }
}
exports.AuthController = AuthController;
