import { Storage } from '@google-cloud/storage';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'weather-app-images';
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
    // debugger
    const fileName = `posts/${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      // public: true,
    });

    blobStream.on('error', (error) => {
      // debugger
      reject(error);
    });
    blobStream.on('finish', () => {
      // debugger
      // console.log('blobStream:', { blobStream, fileName, file });
      // Make the file public and return URL
      // blob.makePublic().then(() => {
      //   const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      //   resolve(publicUrl);
      // }).catch(reject);
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      resolve(publicUrl);
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
    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts.slice(-2).join('/'); // posts/filename.jpg

    const file = bucket.file(fileName);
    // debugger
    // console.log(' file:', file)
    const [exists] = await file.exists();
    if (!exists) {
      return;
    }

    await file.delete();
  } catch (error) {
    console.error('Error deleting image from GCS:', error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const multerUpload = upload;