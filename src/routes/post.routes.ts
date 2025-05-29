import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getPostsByUser,
  getPostsByPlace,
  getPostsByPlaceType,
  approvePost,
  getPendingPosts,
  getPostsByProvince
} from '../controllers/postController';

// Extended Request interface with authenticated user
interface AuthRequest extends Request {
  user?: {
    id_user: string;
    username: string;
    email: string;
    role: {
      role_name: string;
      role_id: string;
    };
  };
}

const router = Router();

// Validation middleware for creating posts
export const validatePost = (req: Request, res: Response, next: NextFunction): void => {
  const { title, body, id_place } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    res.status(400).json({ 
      success: false,
      error: 'Title is required and must be a non-empty string' 
    });
    return;
  }
  
  if (title.length > 255) {
    res.status(400).json({ 
      success: false,
      error: 'Title must be less than 255 characters' 
    });
    return;
  }
  
  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    res.status(400).json({ 
      success: false,
      error: 'Body is required and must be a non-empty string' 
    });
    return;
  }
  
  if (body.length > 10000) {
    res.status(400).json({ 
      success: false,
      error: 'Body must be less than 10000 characters' 
    });
    return;
  }
  
  if (!id_place || typeof id_place !== 'string') {
    res.status(400).json({ 
      success: false,
      error: 'Place ID is required and must be a string' 
    });
    return;
  }
  
  next();
};

// Validation middleware for updating posts
export const validatePostUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { title, body, image } = req.body;
  
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ 
        success: false,
        error: 'Title must be a non-empty string' 
      });
      return;
    }
    
    if (title.length > 255) {
      res.status(400).json({ 
        success: false,
        error: 'Title must be less than 255 characters' 
      });
      return;
    }
  }
  
  if (body !== undefined) {
    if (typeof body !== 'string' || body.trim().length === 0) {
      res.status(400).json({ 
        success: false,
        error: 'Body must be a non-empty string' 
      });
      return;
    }
    
    if (body.length > 10000) {
      res.status(400).json({ 
        success: false,
        error: 'Body must be less than 10000 characters' 
      });
      return;
    }
  }
  
  if (image !== undefined && image !== null && typeof image !== 'string') {
    res.status(400).json({ 
      success: false,
      error: 'Image must be a string or null' 
    });
    return;
  }
  
  next();
};

// Validation middleware for post approval
export const validatePostApproval = (req: Request, res: Response, next: NextFunction): void => {
  const { status } = req.body;
  
  if (!status || !['approved', 'rejected'].includes(status)) {
    res.status(400).json({ 
      success: false,
      error: 'Status must be either "approved" or "rejected"' 
    });
    return;
  }
  
  next();
};

// Authorization middleware for admin/moderator
export const requireAdminOrModerator = (req: Request, res: Response, next: NextFunction): void => {
  const userRole = (req as any).user?.role?.role_name;
  
  if (!['ADMIN', 'MODERATOR'].includes(userRole)) {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Moderator role required'
    });
    return;
  }
  
  next();
};

// Public routes
router.get('/', (req, res) => { getAllPosts(req, res); });
router.get('/:id', (req, res) => { getPostById(req, res); });

// Routes for filtering posts
router.get('/place-type/:placeTypeId', (req, res) => { getPostsByPlaceType(req, res); });
router.get('/province/:provinceId', (req, res) => { getPostsByProvince(req, res); });
router.get('/user/:userId', (req, res) => { getPostsByUser(req, res); });
router.get('/place/:placeId', (req, res) => { getPostsByPlace(req, res); });

// Protected routes - require authentication
router.post('/', 
  passport.authenticate('jwt', { session: false }),
  validatePost,
  (req, res) => {
    createPost(req as AuthRequest, res);
  }
);

router.put('/:id',
  passport.authenticate('jwt', { session: false }),
  validatePostUpdate,
  (req, res) => {
    updatePost(req as AuthRequest, res);
  }
);

router.delete('/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    deletePost(req as AuthRequest, res);
  }
);

// Admin/Moderator only routes
router.get('/admin/pending',
  passport.authenticate('jwt', { session: false }),
  requireAdminOrModerator,
  (req, res) => {
    getPendingPosts(req as AuthRequest, res);
  }
);

router.put('/:id/approve',
  passport.authenticate('jwt', { session: false }),
  requireAdminOrModerator,
  validatePostApproval,
  (req, res) => {
    approvePost(req as AuthRequest, res);
  }
);

export default router;
