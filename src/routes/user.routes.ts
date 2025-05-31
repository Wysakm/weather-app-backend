import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { UserController } from '../controllers/userController';
import { AuthRequest } from '../types/auth.types';

const router = Router();

// Authorization middleware for admin only
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const userRole = (req as any).user?.role?.role_name;
  
  if (userRole !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required'
    });
    return;
  }
  
  next();
};

// All user routes require admin access
// GET /api/users - Get all users with pagination and filtering
router.get('/', 
  passport.authenticate('jwt', { session: false }),
  requireAdmin,
  (req, res) => {
    UserController.getAllUsers(req as AuthRequest, res);
  }
);

// GET /api/users/statistics - Get user statistics
router.get('/statistics',
  passport.authenticate('jwt', { session: false }),
  requireAdmin,
  (req, res) => {
    UserController.getUserStatistics(req as AuthRequest, res);
  }
);

// GET /api/users/:id - Get user by ID
router.get('/:id',
  passport.authenticate('jwt', { session: false }),
  requireAdmin,
  (req, res) => {
    UserController.getUserById(req as AuthRequest, res);
  }
);

export default router;
