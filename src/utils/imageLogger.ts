/**
 * Image Operation Logger
 * Tracks all image upload, update, and delete operations for debugging
 */

import fs from 'fs';
import path from 'path';

interface ImageOperation {
  timestamp: string;
  operation: 'upload' | 'update' | 'delete' | 'access_check';
  imageUrl?: string;
  oldImageUrl?: string;
  newImageUrl?: string;
  postId?: string;
  userId?: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  error?: string;
  metadata?: any;
}

class ImageLogger {
  private logFile: string;
  private logDir: string;

  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.logFile = path.join(this.logDir, 'image-operations.log');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatLogEntry(operation: ImageOperation): string {
    return JSON.stringify(operation) + '\n';
  }

  public logUpload(imageUrl: string, userId?: string, metadata?: any): void {
    const operation: ImageOperation = {
      timestamp: new Date().toISOString(),
      operation: 'upload',
      imageUrl,
      userId,
      status: 'success',
      message: 'Image uploaded successfully',
      metadata
    };

    this.writeLog(operation);
    console.log(`📤 Image Upload: ${imageUrl}`);
  }

  public logUploadError(error: string, userId?: string, metadata?: any): void {
    const operation: ImageOperation = {
      timestamp: new Date().toISOString(),
      operation: 'upload',
      userId,
      status: 'error',
      message: 'Image upload failed',
      error,
      metadata
    };

    this.writeLog(operation);
    console.error(`❌ Image Upload Error: ${error}`);
  }

  public logUpdate(postId: string, oldImageUrl?: string, newImageUrl?: string, userId?: string): void {
    const operation: ImageOperation = {
      timestamp: new Date().toISOString(),
      operation: 'update',
      oldImageUrl,
      newImageUrl,
      postId,
      userId,
      status: 'success',
      message: 'Image updated successfully'
    };

    this.writeLog(operation);
    console.log(`🔄 Image Update - Post: ${postId}, Old: ${oldImageUrl}, New: ${newImageUrl}`);
  }

  public logUpdateError(postId: string, error: string, oldImageUrl?: string, newImageUrl?: string, userId?: string): void {
    const operation: ImageOperation = {
      timestamp: new Date().toISOString(),
      operation: 'update',
      oldImageUrl,
      newImageUrl,
      postId,
      userId,
      status: 'error',
      message: 'Image update failed',
      error
    };

    this.writeLog(operation);
    console.error(`❌ Image Update Error - Post: ${postId}, Error: ${error}`);
  }

  public logDelete(imageUrl: string, postId?: string, userId?: string): void {
    const operation: ImageOperation = {
      timestamp: new Date().toISOString(),
      operation: 'delete',
      imageUrl,
      postId,
      userId,
      status: 'success',
      message: 'Image deleted successfully'
    };

    this.writeLog(operation);
    console.log(`🗑️ Image Delete: ${imageUrl}`);
  }

  public logDeleteError(imageUrl: string, error: string, postId?: string, userId?: string): void {
    const operation: ImageOperation = {
      timestamp: new Date().toISOString(),
      operation: 'delete',
      imageUrl,
      postId,
      userId,
      status: 'error',
      message: 'Image deletion failed',
      error
    };

    this.writeLog(operation);
    console.error(`❌ Image Delete Error: ${imageUrl}, Error: ${error}`);
  }

  public logAccessCheck(imageUrl: string, exists: boolean, metadata?: any): void {
    const operation: ImageOperation = {
      timestamp: new Date().toISOString(),
      operation: 'access_check',
      imageUrl,
      status: exists ? 'success' : 'warning',
      message: exists ? 'Image exists and accessible' : 'Image not found or not accessible',
      metadata
    };

    this.writeLog(operation);
    console.log(`🔍 Image Access Check: ${imageUrl} - ${exists ? 'EXISTS' : 'NOT FOUND'}`);
  }

  private writeLog(operation: ImageOperation): void {
    try {
      fs.appendFileSync(this.logFile, this.formatLogEntry(operation));
    } catch (error) {
      console.error('Failed to write to image log:', error);
    }
  }

  public getRecentLogs(limit: number = 100): ImageOperation[] {
    try {
      if (!fs.existsSync(this.logFile)) {
        return [];
      }

      const content = fs.readFileSync(this.logFile, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      return lines
        .slice(-limit)
        .map(line => {
          try {
            return JSON.parse(line) as ImageOperation;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as ImageOperation[];
    } catch (error) {
      console.error('Failed to read image logs:', error);
      return [];
    }
  }

  public getErrorLogs(limit: number = 50): ImageOperation[] {
    return this.getRecentLogs(1000)
      .filter(op => op.status === 'error')
      .slice(-limit);
  }

  public clearLogs(): void {
    try {
      if (fs.existsSync(this.logFile)) {
        fs.unlinkSync(this.logFile);
        console.log('✅ Image logs cleared');
      }
    } catch (error) {
      console.error('Failed to clear image logs:', error);
    }
  }
}

// Singleton instance
export const imageLogger = new ImageLogger();
export { ImageLogger, ImageOperation };
