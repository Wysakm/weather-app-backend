#!/usr/bin/env ts-node

/**
 * Image Debug Script
 * This script helps debug image upload and deletion issues
 */

import { PrismaClient } from '@prisma/client';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'weather-app-store';
const bucket = storage.bucket(bucketName);

interface ImageAnalysis {
  totalPosts: number;
  postsWithImages: number;
  postsWithoutImages: number;
  uniqueImageUrls: string[];
  orphanedImages: string[];
  brokenImageUrls: string[];
  storageFiles: string[];
}

async function analyzeImages(): Promise<ImageAnalysis> {
  console.log('🔍 Starting image analysis...\n');

  // Get all posts with images
  const posts = await prisma.post.findMany({
    select: {
      id_post: true,
      title: true,
      image: true,
      created_at: true,
    },
  });

  const totalPosts = posts.length;
  const postsWithImages = posts.filter(p => p.image).length;
  const postsWithoutImages = totalPosts - postsWithImages;

  // Get unique image URLs
  const imageUrls = posts
    .map(p => p.image)
    .filter(Boolean) as string[];
  const uniqueImageUrls = [...new Set(imageUrls)];

  console.log(`📊 Database Analysis:`);
  console.log(`   Total posts: ${totalPosts}`);
  console.log(`   Posts with images: ${postsWithImages}`);
  console.log(`   Posts without images: ${postsWithoutImages}`);
  console.log(`   Unique image URLs: ${uniqueImageUrls.length}\n`);

  // Get files from Google Cloud Storage
  console.log('☁️ Checking Google Cloud Storage...');
  const [files] = await bucket.getFiles({ prefix: 'posts/' });
  const storageFiles = files.map(file => file.name);

  console.log(`   Files in GCS bucket: ${storageFiles.length}\n`);

  // Check for broken image URLs (images in DB but not in storage)
  const brokenImageUrls: string[] = [];
  for (const imageUrl of uniqueImageUrls) {
    try {
      const fileName = extractFileNameFromUrl(imageUrl);
      if (fileName && !storageFiles.includes(fileName)) {
        brokenImageUrls.push(imageUrl);
      }
    } catch (error) {
      brokenImageUrls.push(imageUrl);
    }
  }

  // Check for orphaned images (files in storage but not referenced in DB)
  const referencedFileNames = uniqueImageUrls
    .map(url => extractFileNameFromUrl(url))
    .filter(Boolean);
  const orphanedImages = storageFiles.filter(
    fileName => !referencedFileNames.includes(fileName)
  );

  console.log(`🚨 Issues Found:`);
  console.log(`   Broken image URLs: ${brokenImageUrls.length}`);
  console.log(`   Orphaned files: ${orphanedImages.length}\n`);

  if (brokenImageUrls.length > 0) {
    console.log(`❌ Broken Image URLs:`);
    brokenImageUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });
    console.log('');
  }

  if (orphanedImages.length > 0) {
    console.log(`🗂️ Orphaned Files (first 10):`);
    orphanedImages.slice(0, 10).forEach((fileName, index) => {
      console.log(`   ${index + 1}. ${fileName}`);
    });
    if (orphanedImages.length > 10) {
      console.log(`   ... and ${orphanedImages.length - 10} more`);
    }
    console.log('');
  }

  return {
    totalPosts,
    postsWithImages,
    postsWithoutImages,
    uniqueImageUrls,
    orphanedImages,
    brokenImageUrls,
    storageFiles,
  };
}

function extractFileNameFromUrl(imageUrl: string): string | null {
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
}

async function checkImageAccessibility(imageUrl: string): Promise<boolean> {
  try {
    const fileName = extractFileNameFromUrl(imageUrl);
    if (!fileName) return false;

    const file = bucket.file(fileName);
    const [exists] = await file.exists();
    return exists;
  } catch (error) {
    return false;
  }
}

async function cleanupOrphanedImages(dryRun: boolean = true): Promise<void> {
  console.log(`🧹 ${dryRun ? 'DRY RUN - ' : ''}Cleaning up orphaned images...\n`);

  const analysis = await analyzeImages();
  
  if (analysis.orphanedImages.length === 0) {
    console.log('✅ No orphaned images found!');
    return;
  }

  console.log(`Found ${analysis.orphanedImages.length} orphaned images`);
  
  if (dryRun) {
    console.log('This is a dry run - no files will be deleted');
    console.log('To actually delete files, run: npm run debug-images -- --cleanup --no-dry-run');
    return;
  }

  for (const fileName of analysis.orphanedImages) {
    try {
      const file = bucket.file(fileName);
      await file.delete();
      console.log(`✅ Deleted: ${fileName}`);
    } catch (error) {
      console.error(`❌ Failed to delete ${fileName}:`, error);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isCleanup = args.includes('--cleanup');
  const isDryRun = !args.includes('--no-dry-run');

  try {
    if (isCleanup) {
      await cleanupOrphanedImages(isDryRun);
    } else {
      await analyzeImages();
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { analyzeImages, cleanupOrphanedImages, checkImageAccessibility };
