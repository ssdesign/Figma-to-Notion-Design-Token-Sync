/**
 * Test syncing a single color token to verify image upload works correctly
 */
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { uploadSvgToNotion, generateColorSwatchSVGString, extractHexColor } from './utils/colorSwatch';

dotenv.config();

async function testSingleColorSync() {
  console.log('🧪 Testing single color token sync with image upload...\n');
  
  const notion = new Client({ auth: process.env.NOTION_TOKEN! });
  const dbId = process.env.NOTION_DB_ID!.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
  
  // Test token data
  const tokenName = 'Sys/outline/error';
  const colorValue = '#ed7d70';
  
  console.log(`Token: ${tokenName}`);
  console.log(`Color: ${colorValue}`);
  console.log('\n📤 Uploading color swatch to Notion...');
  
  // Generate SVG and upload to Notion
  const hexColor = extractHexColor(colorValue);
  if (!hexColor) {
    console.log('❌ Could not extract hex color');
    return;
  }
  
  const svg = generateColorSwatchSVGString(hexColor);
  const fileName = `${tokenName.replace(/[^a-zA-Z0-9]/g, '_')}-swatch.svg`;
  const fileData = await uploadSvgToNotion(svg, fileName, process.env.NOTION_TOKEN!);
  
  if (!fileData) {
    console.log('❌ Failed to upload SVG to Notion');
    return;
  }
  
  console.log(`✅ File uploaded! ID: ${fileData.id}`);
  console.log(`   URL: ${fileData.url.substring(0, 80)}...`);
  
  // Find if this token already exists
  console.log('\n🔍 Checking if token already exists in database...');
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
    console.log(`   Found existing page, updating...`);
    
    await notion.pages.update({
      page_id: pageId,
      properties: {
        'Value': {
          rich_text: [{ text: { content: colorValue } }]
        },
        'Category': {
          select: { name: 'Color' }
        },
        'Image': {
          files: [
            {
              name: fileName,
              type: 'external',
              external: {
                url: fileData.url
              }
            }
          ]
        } as any
      }
    });
    console.log(`   ✅ Updated existing page`);
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
                url: fileData.url
              }
            }
          ]
        } as any
      }
    });
    console.log(`   ✅ Created new page`);
  }
  
  console.log('\n✅ Sync complete!');
  console.log('\n👀 Please check your Notion database to verify:');
  console.log(`   1. The "${tokenName}" token is there`);
  console.log('   2. The "Image" column shows a color swatch');
  console.log(`   3. The color looks correct (${colorValue} - coral/salmon color)`);
  console.log('\n⏳ Please confirm if the image displays correctly before we sync all tokens.');
}

testSingleColorSync().catch(console.error);
