import { Response } from 'express';
import { uploadImageToGCS, uploadMultipleImagesToGCS } from '../services/uploadService';
import { AuthRequest } from '../types/auth.types';

// Upload single image
export const uploadPostImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'กรุณาเลือกไฟล์รูปภาพ'
      });
      return;
    }

    const imageUrl = await uploadImageToGCS(req.file);

    res.json({
      success: true,
      message: 'อัพโหลดรูปภาพสำเร็จ',
      data: {
        imageUrl
      }
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Upload multiple images
export const uploadPostImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'กรุณาเลือกไฟล์รูปภาพ'
      });
      return;
    }

    const imageUrls = await uploadMultipleImagesToGCS(req.files);

    res.json({
      success: true,
      message: 'อัพโหลดรูปภาพสำเร็จ',
      data: {
        imageUrls
      }
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Debug endpoint to check image status
export const checkImageStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      res.status(400).json({
        success: false,
        message: 'imageUrl is required'
      });
      return;
    }

    const { getImageMetadata, validateImageUrl } = await import('../services/uploadService');
    
    const isValidUrl = validateImageUrl(imageUrl);
    const metadata = await getImageMetadata(imageUrl);

    res.json({
      success: true,
      data: {
        imageUrl,
        isValidUrl,
        metadata,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error checking image status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check image status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get image operation logs for debugging
export const getImageLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only allow admins to view logs
    if (req.user?.role.role_name !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    const { imageLogger } = await import('../utils/imageLogger');
    const limit = req.query.limit as string || '100';
    const errorsOnly = req.query.errors_only as string || 'false';

    const logs = errorsOnly === 'true' 
      ? imageLogger.getErrorLogs(parseInt(limit))
      : imageLogger.getRecentLogs(parseInt(limit));

    res.json({
      success: true,
      data: {
        logs,
        total: logs.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting image logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get image logs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};