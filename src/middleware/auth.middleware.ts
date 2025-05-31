import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthenticatedUser } from '../types/auth.types';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access token required'
    });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
      return;
    }

    // Map the JWT payload to the expected user structure
    req.user = {
      id_user: decoded.id_user,
      username: decoded.username,
      email: decoded.email,
      role: {
        role_name: decoded.role || 'USER',
        role_id: '1' // Default role_id since it's not in the JWT payload
      }
    } as AuthenticatedUser;
    
    next();
  });
};