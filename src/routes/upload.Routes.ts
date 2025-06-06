import express, { Request, Response } from 'express';
import { uploadPostImage, uploadPostImages, checkImageStatus, getImageLogs } from '../controllers/upload.Controller';
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

const checkImageStatusHandler = async (req: Request, res: Response): Promise<void> => {
  await checkImageStatus(req as AuthRequest, res);
};

const getImageLogsHandler = async (req: Request, res: Response): Promise<void> => {
  await getImageLogs(req as AuthRequest, res);
};

// Upload single image
router.post('/image', authenticateToken as any, multerUpload.single('image'), uploadImageHandler);

// Upload multiple images
router.post('/images', authenticateToken as any, multerUpload.array('images', 10), uploadImagesHandler);

// Debug endpoint to check image status
router.post('/check-image', authenticateToken as any, checkImageStatusHandler);

// Debug endpoint to get image operation logs (admin only)
router.get('/logs', authenticateToken as any, getImageLogsHandler);

export default router;