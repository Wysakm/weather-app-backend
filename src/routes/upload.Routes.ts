import express, { Request, Response } from 'express';
import { uploadPostImage, uploadPostImages } from '../controllers/upload.Controller';
import { multerUpload } from '../services/uploadService';
import { authenticateToken } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/auth.types';

const router = express.Router();

// Wrapper functions to handle type compatibility
const uploadImageHandler = async (req: Request, res: Response): Promise<void> => {
  await uploadPostImage(req as AuthRequest, res);
};

const uploadImagesHandler = async (req: Request, res: Response): Promise<void> => {
  await uploadPostImages(req as AuthRequest, res);
};

// Upload single image
router.post('/image', authenticateToken as any, multerUpload.single('image'), uploadImageHandler);

// Upload multiple images
router.post('/images', authenticateToken as any, multerUpload.array('images', 10), uploadImagesHandler);

export default router;