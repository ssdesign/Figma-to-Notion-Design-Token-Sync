/**
 * Test image upload to Notion
 */
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { uploadSvgToNotion, generateColorSwatchSVGString, extractHexColor } from './utils/colorSwatch';

dotenv.config();

async function test() {
  const notion = new Client({ auth: process.env.NOTION_TOKEN! });
  const dbId = process.env.NOTION_DB_ID!.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
  
  // Find a color token
  const results = await notion.databases.query({ 
    database_id: dbId,
    filter: {
      property: 'Category',
      select: {
        equals: 'Color'
      }
    },
    page_size: 1
  });
  
  if (results.results.length === 0) {
    console.log('No color tokens found');
    return;
  }
  
  const page = results.results[0] as any;
  const pageId = page.id;
  const tokenName = page.properties?.Name?.title?.[0]?.text?.content || 'Unknown';
  const colorValue = page.properties?.Value?.rich_text?.[0]?.text?.content || '';
  
  console.log(`Testing with token: ${tokenName}`);
  console.log(`Color value: ${colorValue}`);
  
  const hexColor = extractHexColor(colorValue);
  if (!hexColor) {
    console.log('Could not extract hex color');
    return;
  }
  
  console.log(`Extracted hex: ${hexColor}`);
  
  // Generate SVG and upload to Notion
  const svg = generateColorSwatchSVGString(hexColor);
  const fileName = `${tokenName.replace(/[^a-zA-Z0-9]/g, '_')}-swatch.svg`;
  const fileData = await uploadSvgToNotion(svg, fileName, process.env.NOTION_TOKEN!);
  
  if (!fileData) {
    console.log('❌ Failed to upload SVG to Notion');
    return;
  }
  
  console.log(`Uploaded SVG, file ID: ${fileData.id}`);
  console.log(`File URL: ${fileData.url}`);
  
  // Try to update the page with the image - Method 1: Using file ID only
  try {
    console.log('\nAttempt 1: Using only file ID...');
    await notion.pages.update({
      page_id: pageId,
      properties: {
        'Image': {
          files: [
            {
              name: fileName,
              file_id: fileData.id
            }
          ]
        } as any
      }
    });
    console.log('✅ Successfully updated page with image!');
  } catch (error: any) {
    console.error('❌ Attempt 1 failed:', error.message);
    
    // Try Method 2: Using external type
    try {
      console.log('\nAttempt 2: Using external type with constructed URL...');
      await notion.pages.update({
        page_id: pageId,
        properties: {
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
      console.log('✅ Successfully updated page with image (external)!');
    } catch (error2: any) {
      console.error('❌ Attempt 2 also failed:', error2.message);
      if (error2.body) {
        console.error('Error body:', JSON.parse(error2.body).message);
      }
    }
  }
}

test().catch(console.error);

