import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller';
import { 
  passwordResetLimiter, 
  loginLimiter, 
  registerLimiter 
} from '../middleware/rateLimiter.middleware';

const router = Router();

// Public routes with rate limiting
router.post('/register', registerLimiter, AuthController.register);
router.post('/login', loginLimiter, passport.authenticate('local', { session: false }), AuthController.login);

// Password reset routes with rate limiting
router.post('/forgot-password', passwordResetLimiter, AuthController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, AuthController.resetPassword);
router.post('/verify-reset-token', passwordResetLimiter, AuthController.verifyResetToken);

// Token verification route
router.post('/verify', AuthController.verifyToken);

// Protected routes
router.get('/me', passport.authenticate('jwt', { session: false }), AuthController.getMe);
router.put('/profile', passport.authenticate('jwt', { session: false }), AuthController.updateProfile);
router.post('/change-password', passport.authenticate('jwt', { session: false }), AuthController.changePassword);

export default router;