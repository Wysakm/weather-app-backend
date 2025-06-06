#!/usr/bin/env ts-node

/**
 * Simple Image Test Script
 * Tests the image upload and deletion functionality
 */

import { PrismaClient } from '@prisma/client';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'weather-app-store';

async function testImageConsistency() {
  console.log('🔍 Testing image consistency...\n');

  try {
    // Get posts with images
    const posts = await prisma.post.findMany({
      where: {
        image: { not: null }
      },
      select: {
        id_post: true,
        title: true,
        image: true,
      },
      take: 5
    });

    console.log(`📝 Testing ${posts.length} posts with images:`);

    for (const post of posts) {
      if (!post.image) continue;

      // Extract filename
      const fileName = post.image.includes('storage.googleapis.com') 
        ? post.image.split(`${bucketName}/`)[1]
        : post.image;

      // Check if file exists
      try {
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);
        const [exists] = await file.exists();

        console.log(`${exists ? '✅' : '❌'} Post: "${post.title.substring(0, 30)}..." - Image: ${exists ? 'EXISTS' : 'MISSING'}`);
        
        if (!exists) {
          console.log(`   URL: ${post.image}`);
          console.log(`   File: ${fileName}`);
        }
      } catch (error) {
        console.log(`❌ Error checking post "${post.title}": ${error}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testImageConsistency();
}
