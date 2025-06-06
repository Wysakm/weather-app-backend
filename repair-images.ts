#!/usr/bin/env ts-node

/**
 * Image Repair Script
 * This script fixes broken image references and cleans up orphaned files
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

interface RepairReport {
  fixedPosts: number;
  removedOrphans: number;
  errors: string[];
}

async function repairBrokenImages(dryRun: boolean = true): Promise<RepairReport> {
  console.log(`🔧 ${dryRun ? 'DRY RUN - ' : ''}Starting image repair process...\n`);

  const report: RepairReport = {
    fixedPosts: 0,
    removedOrphans: 0,
    errors: []
  };

  try {
    // Get all posts with images
    const posts = await prisma.post.findMany({
      select: {
        id_post: true,
        title: true,
        image: true,
      },
      where: {
        image: {
          not: null
        }
      }
    });

    console.log(`📊 Found ${posts.length} posts with images`);

    // Get files from Google Cloud Storage
    const [files] = await bucket.getFiles({ prefix: 'posts/' });
    const storageFiles = files.map(file => file.name);

    console.log(`☁️ Found ${storageFiles.length} files in storage\n`);

    // Check each post's image
    for (const post of posts) {
      if (!post.image) continue;

      const fileName = extractFileNameFromUrl(post.image);
      if (!fileName) {
        console.log(`⚠️ Could not extract filename from: ${post.image}`);
        report.errors.push(`Invalid URL format: ${post.image}`);
        continue;
      }

      // Check if file exists in storage
      const fileExists = storageFiles.includes(fileName);
      
      if (!fileExists) {
        console.log(`❌ Missing file for post "${post.title}": ${fileName}`);
        
        // Try to find a similar file (same base name)
        const baseName = fileName.split('/').pop()?.split('-').slice(2).join('-');
        const similarFiles = storageFiles.filter(f => 
          f.includes(baseName?.substring(0, 20) || '') || 
          baseName?.includes(f.split('/').pop()?.split('-').slice(2).join('-')?.substring(0, 20) || '')
        );

        if (similarFiles.length > 0) {
          console.log(`🔄 Found potential replacement: ${similarFiles[0]}`);
          
          if (!dryRun) {
            const newUrl = `https://storage.googleapis.com/${bucketName}/${similarFiles[0]}`;
            await prisma.post.update({
              where: { id_post: post.id_post },
              data: { image: newUrl }
            });
            report.fixedPosts++;
            console.log(`✅ Fixed post "${post.title}" with new image URL`);
          }
        } else {
          console.log(`❌ No replacement found, will set image to null`);
          
          if (!dryRun) {
            await prisma.post.update({
              where: { id_post: post.id_post },
              data: { image: null }
            });
            report.fixedPosts++;
            console.log(`✅ Removed broken image from post "${post.title}"`);
          }
        }
      } else {
        console.log(`✅ Image OK for post "${post.title}"`);
      }
    }

    // Clean up orphaned files
    console.log(`\n🧹 Checking for orphaned files...`);
    
    const referencedFileNames = posts
      .map(p => extractFileNameFromUrl(p.image))
      .filter(Boolean) as string[];
    
    const orphanedFiles = storageFiles.filter(
      fileName => !referencedFileNames.includes(fileName)
    );

    if (orphanedFiles.length > 0) {
      console.log(`Found ${orphanedFiles.length} orphaned files`);
      
      for (const fileName of orphanedFiles) {
        console.log(`🗑️ Orphaned: ${fileName}`);
        
        if (!dryRun) {
          try {
            const file = bucket.file(fileName);
            await file.delete();
            report.removedOrphans++;
            console.log(`✅ Deleted orphaned file: ${fileName}`);
          } catch (error) {
            const errorMsg = `Failed to delete ${fileName}: ${error}`;
            console.error(`❌ ${errorMsg}`);
            report.errors.push(errorMsg);
          }
        }
      }
    }

  } catch (error) {
    const errorMsg = `Repair process failed: ${error}`;
    console.error(`❌ ${errorMsg}`);
    report.errors.push(errorMsg);
  }

  return report;
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

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = !args.includes('--no-dry-run');

  try {
    const report = await repairBrokenImages(isDryRun);
    
    console.log(`\n📋 Repair Report:`);
    console.log(`   Fixed posts: ${report.fixedPosts}`);
    console.log(`   Removed orphans: ${report.removedOrphans}`);
    console.log(`   Errors: ${report.errors.length}`);
    
    if (report.errors.length > 0) {
      console.log(`\n❌ Errors:`);
      report.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (isDryRun) {
      console.log(`\n💡 This was a dry run. To actually apply fixes, run:`);
      console.log(`   npm run repair:images -- --no-dry-run`);
    } else {
      console.log(`\n✅ Image repair completed!`);
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

export { repairBrokenImages };
