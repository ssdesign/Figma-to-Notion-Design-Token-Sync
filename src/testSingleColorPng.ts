/**
 * Test syncing a single color token with PNG image upload to external hosting
 */
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { uploadColorSwatchPng, extractHexColor } from './utils/colorSwatch';

dotenv.config();

async function testSingleColorPng() {
  console.log('🧪 Testing PNG color swatch upload to external hosting...\n');
  
  const notion = new Client({ auth: process.env.NOTION_TOKEN! });
  const dbId = process.env.NOTION_DB_ID!.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
  
  // Test token data
  const tokenName = 'Sys/outline/error';
  const colorValue = '#ed7d70';
  
  console.log(`Token: ${tokenName}`);
  console.log(`Color: ${colorValue}`);
  console.log('\n📤 Generating PNG and uploading to external hosting...');
  
  if (process.env.IMGBB_API_KEY) {
    console.log('   Using ImgBB (with API key)');
  } else {
    console.log('   Using freeimage.host (no API key needed)');
    console.log('   💡 Tip: Set IMGBB_API_KEY in .env for more reliable uploads');
  }
  
  // Generate PNG and upload
  const hexColor = extractHexColor(colorValue);
  if (!hexColor) {
    console.log('❌ Could not extract hex color');
    return;
  }
  
  const fileName = `${tokenName.replace(/[^a-zA-Z0-9]/g, '_')}-swatch.png`;
  const imageUrl = await uploadColorSwatchPng(hexColor, fileName);
  
  if (!imageUrl) {
    console.log('❌ Failed to upload PNG to external hosting');
    return;
  }
  
  console.log(`✅ PNG uploaded!`);
  console.log(`   URL: ${imageUrl}`);
  
  // Find if this token already exists
  console.log('\n🔍 Updating token in database...');
  const existing = await notion.databases.query({
    database_id: dbId,
    filter: {
      property: 'Name',
      title: {
        equals: tokenName
      }
    }
  });
  
  if (existing.results.length > 0) {
    const pageId = existing.results[0].id;
    console.log(`   Updating existing page...`);
    
    await notion.pages.update({
      page_id: pageId,
      properties: {
        'Image': {
          files: [
            {
              name: fileName,
              type: 'external',
              external: {
                url: imageUrl
              }
            }
          ]
        } as any
      }
    });
    console.log(`   ✅ Updated!`);
  } else {
    console.log(`   Creating new page...`);
    
    await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        'Name': {
          title: [{ text: { content: tokenName } }]
        },
        'Value': {
          rich_text: [{ text: { content: colorValue } }]
        },
        'Category': {
          select: { name: 'Color' }
        },
        'Collection': {
          select: { name: 'Sys' }
        },
        'Mode': {
          select: { name: 'Light' }
        },
        'Type': {
          select: { name: 'Variable' }
        },
        'Resolved Value': {
          rich_text: [{ text: { content: colorValue } }]
        },
        'Figma ID': {
          rich_text: [{ text: { content: 'VariableID:3049:19913' } }]
        },
        'Figma Collection': {
          rich_text: [{ text: { content: 'Sys' } }]
        },
        'Status': {
          select: { name: 'In Sync' }
        },
        'Last Synced': {
          date: { start: new Date().toISOString() }
        },
        'CSS Variable': {
          rich_text: [{ text: { content: '' } }]
        },
        'Code Path': {
          rich_text: [{ text: { content: '' } }]
        },
        'Component Usage': {
          multi_select: []
        },
        'Image': {
          files: [
            {
              name: fileName,
              type: 'external',
              external: {
                url: imageUrl
              }
            }
          ]
        } as any
      }
    });
    console.log(`   ✅ Created!`);
  }
  
  console.log('\n✅ Sync complete!');
  console.log('\n👀 Please check your Notion database NOW:');
  console.log(`   1. Find the "${tokenName}" token`);
  console.log('   2. Check if the "Image" column shows a color swatch (not broken!)');
  console.log(`   3. Verify the color looks correct (${colorValue} - coral/salmon color)`);
  console.log('\n⏳ If it works, I\'ll sync all tokens. If not, we\'ll try another approach.');
}

testSingleColorPng().catch(console.error);

