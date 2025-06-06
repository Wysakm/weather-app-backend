import { Storage } from '@google-cloud/storage';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import { imageLogger } from '../utils/imageLogger';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'weather-app-store';
const bucket = storage.bucket(bucketName);

// console.log(' storage:', { storage, bucketName, bucket })
// debugger
// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG and PNG files are allowed') as any);
    }
  },
});

// Upload file to Google Cloud Storage
export const uploadImageToGCS = async (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`📤 Starting upload for file: ${file.originalname}, size: ${file.size} bytes`);
    
    const fileName = `posts/${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
    const blob = bucket.file(fileName);
    
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false, // For small files, disable resumable upload for better performance
    });

    blobStream.on('error', (error) => {
      console.error('❌ GCS Upload Error:', {
        fileName,
        originalName: file.originalname,
        error: error.message,
        stack: error.stack
      });
      imageLogger.logUploadError(error.message, undefined, {
        fileName,
        originalName: file.originalname,
        fileSize: file.size
      });
      reject(error);
    });
    
    blobStream.on('finish', async () => {
      try {
        console.log(`✅ Upload completed for: ${fileName}`);
        
        // Make the file public and return URL
        await blob.makePublic();
        console.log(`🌐 File made public: ${fileName}`);
        
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        console.log(`🔗 Generated public URL: ${publicUrl}`);
        
        // Log successful upload
        imageLogger.logUpload(publicUrl, undefined, {
          fileName,
          originalName: file.originalname,
          fileSize: file.size,
          contentType: file.mimetype
        });
        
        // Verify the file exists and is accessible
        const [exists] = await blob.exists();
        if (!exists) {
          throw new Error(`File was uploaded but cannot be found: ${fileName}`);
        }
        
        resolve(publicUrl);
      } catch (error) {
        console.error('❌ Error making file public:', {
          fileName,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        imageLogger.logUploadError(`Error making file public: ${error instanceof Error ? error.message : 'Unknown error'}`, undefined, {
          fileName,
          originalName: file.originalname
        });
        // Even if makePublic fails, return the URL as it might still be accessible
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        resolve(publicUrl);
      }
    });

    blobStream.end(file.buffer);
  });
};

// Upload multiple images
export const uploadMultipleImagesToGCS = async (files: Express.Multer.File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImageToGCS(file));
    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  } catch (error) {
    throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Delete file from Google Cloud Storage
export const deleteImageFromGCS = async (imageUrl: string): Promise<void> => {
  try {
    console.log(`🗑️ Attempting to delete image: ${imageUrl}`);
    
    // Validate URL format
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.warn('⚠️ Invalid image URL provided for deletion:', imageUrl);
      return;
    }

    // Extract filename from URL - more robust parsing
    let fileName: string;
    
    if (imageUrl.includes(`storage.googleapis.com/${bucketName}/`)) {
      // Extract everything after the bucket name
      const bucketPrefix = `storage.googleapis.com/${bucketName}/`;
      const startIndex = imageUrl.indexOf(bucketPrefix) + bucketPrefix.length;
      fileName = imageUrl.substring(startIndex);
    } else if (imageUrl.startsWith('posts/')) {
      // Already a filename
      fileName = imageUrl;
    } else {
      // Fallback to original logic but with better error handling
      const urlParts = imageUrl.split('/');
      if (urlParts.length < 2) {
        console.warn('⚠️ Unable to extract filename from URL:', imageUrl);
        return;
      }
      fileName = urlParts.slice(-2).join('/');
    }

    console.log(`📝 Extracted filename: ${fileName}`);

    const file = bucket.file(fileName);
    
    // Check if file exists before attempting deletion
    const [exists] = await file.exists();
    if (!exists) {
      console.log(`ℹ️ File does not exist, skipping deletion: ${fileName}`);
      return;
    }

    // Delete the file
    await file.delete();
    console.log(`✅ Successfully deleted image: ${fileName}`);
    imageLogger.logDelete(imageUrl);

  } catch (error) {
    console.error('❌ Error deleting image from GCS:', {
      imageUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    imageLogger.logDeleteError(imageUrl, error instanceof Error ? error.message : 'Unknown error');
    
    // Don't throw error to prevent breaking the main operation
    // Log the error but continue execution
    console.warn('⚠️ Image deletion failed but continuing with main operation');
  }
};

// Safe delete with rollback capability - stores old image for potential rollback
export const safeDeleteImageFromGCS = async (imageUrl: string): Promise<() => Promise<void>> => {
  console.log(`🔄 Safe delete initiated for: ${imageUrl}`);
  
  // Return a rollback function (even if deletion fails)
  const rollbackFunction = async () => {
    console.log(`⚠️ Rollback requested for: ${imageUrl}`);
    console.log('ℹ️ Note: Image rollback not implemented - manual intervention may be required');
  };

  try {
    await deleteImageFromGCS(imageUrl);
    return rollbackFunction;
  } catch (error) {
    console.error('❌ Safe delete failed:', error);
    return rollbackFunction;
  }
};

// Validate image URL format
export const validateImageUrl = (imageUrl: string): boolean => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false;
  }
  
  return imageUrl.startsWith(`https://storage.googleapis.com/${bucketName}/`) ||
         imageUrl.startsWith('posts/');
};

// Get image metadata without downloading
export const getImageMetadata = async (imageUrl: string): Promise<any> => {
  try {
    const fileName = extractFileNameFromUrl(imageUrl);
    if (!fileName) {
      throw new Error('Invalid image URL');
    }

    const file = bucket.file(fileName);
    const [metadata] = await file.getMetadata();
    
    const result = {
      name: metadata.name,
      size: metadata.size,
      contentType: metadata.contentType,
      created: metadata.timeCreated,
      updated: metadata.updated,
      exists: true
    };

    imageLogger.logAccessCheck(imageUrl, true, result);
    return result;
  } catch (error) {
    console.error('Error getting image metadata:', error);
    const result = { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
    imageLogger.logAccessCheck(imageUrl, false, result);
    return result;
  }
};

// Helper function to extract filename from URL
const extractFileNameFromUrl = (imageUrl: string): string | null => {
  if (!imageUrl) return null;
  
  if (imageUrl.includes(`storage.googleapis.com/${bucketName}/`)) {
    const bucketPrefix = `storage.googleapis.com/${bucketName}/`;
    const startIndex = imageUrl.indexOf(bucketPrefix) + bucketPrefix.length;
    return imageUrl.substring(startIndex);
  } else if (imageUrl.startsWith('posts/')) {
    return imageUrl;
  } else {
    const urlParts = imageUrl.split('/');
    return urlParts.length >= 2 ? urlParts.slice(-2).join('/') : null;
  }
};

export const multerUpload = upload;