import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', passport.authenticate('local', { session: false }), AuthController.login);

// Password reset routes
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/verify-reset-token', AuthController.verifyResetToken);

// Token verification route
router.post('/verify', AuthController.verifyToken);

// Protected routes
router.get('/me', passport.authenticate('jwt', { session: false }), AuthController.getMe);
router.post('/change-password', passport.authenticate('jwt', { session: false }), AuthController.changePassword);

export default router;