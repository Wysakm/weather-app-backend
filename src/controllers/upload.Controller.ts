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