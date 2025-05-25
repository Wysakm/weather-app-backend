import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  // Register
  static async register(req: Request, res: Response, next: NextFunction) {
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
        })
      }

      const result = await AuthService.register(email, password, username, role);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Login
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = req.user as any;

      res.json({
        success: true,
        data: { user, token }
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get current user
  static async getMe(req: Request, res: Response, next: NextFunction) {
    res.json({
      success: true,
      data: { user: req.user }
    });
  }

  // Forgot password
  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);
      res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
      next(error);
    }
  }

  // Reset password
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      await AuthService.resetPassword(token, newPassword);
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Verify reset token
  static async verifyResetToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      const isValid = await AuthService.verifyResetToken(token);
      res.status(200).json({ valid: isValid });
    } catch (error) {
      next(error);
    }
  }

  // Change password
  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req.user as any).id_user;
      await AuthService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Verify JWT token
  static async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const result = await AuthService.verifyToken(token);
      
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  }
}