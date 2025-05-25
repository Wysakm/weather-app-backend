import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  // Register
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, username } = req.body;

      // Validate input
      if (!email || !password) {
        // return res.status(400).json({
        //   success: false,
        //   message: 'Email and password are required'
        // });
        next({
          success: false,
          message: 'Email and password are required'
        })
      }

      const result = await AuthService.register(email, password, username);

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
}