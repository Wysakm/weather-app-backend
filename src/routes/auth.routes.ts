import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller';
import { validateRegister } from '../middleware/validation.middleware';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', passport.authenticate('local', { session: false }), AuthController.login);

// Protected routes
router.get('/me', passport.authenticate('jwt', { session: false }), AuthController.getMe);

export default router;