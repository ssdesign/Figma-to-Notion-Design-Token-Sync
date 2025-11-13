/**
 * Force update the green token with a fresh upload
 */
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { uploadColorSwatchPng } from './utils/colorSwatch';

dotenv.config();

async function forceUpdateGreen() {
  console.log('🔄 Force updating green token with fresh image...\n');
  
  const notion = new Client({ auth: process.env.NOTION_TOKEN! });
  const dbId = process.env.NOTION_DB_ID!.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
  
  // Generate a NEW upload (different URL to bypass any caching)
  console.log('📤 Generating fresh green image...');
  const imageUrl = await uploadColorSwatchPng('#4caf50', 'green-fresh.png');
  
  if (!imageUrl) {
    console.log('❌ Upload failed');
    return;
  }
  
  console.log(`✅ New URL: ${imageUrl}`);
  
  // Find the green token
  const results = await notion.databases.query({
    database_id: dbId,
    filter: {
      property: 'Name',
      title: {
        equals: 'Sys/fill/success'
      }
    }
  });
  
  if (results.results.length === 0) {
    console.log('❌ Sys/fill/success not found');
    return;
  }
  
  const pageId = results.results[0].id;
  
  // Clear the image first, then set it again (to force refresh)
  console.log('🗑️  Clearing old image...');
  await notion.pages.update({
    page_id: pageId,
    properties: {
      'Image': {
        files: []
      } as any
    }
  });
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Set new image
  console.log('✨ Setting new image...');
  await notion.pages.update({
    page_id: pageId,
    properties: {
      'Image': {
        files: [
          {
            name: 'green-fresh.png',
            type: 'external',
            external: {
              url: imageUrl
            }
          }
        ]
      } as any
    }
  });
  
  console.log('✅ Updated!');
  console.log('\n👀 Check Notion now - the green square should appear.');
}

forceUpdateGreen().catch(console.error);

