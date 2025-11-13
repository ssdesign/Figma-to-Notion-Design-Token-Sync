/**
 * Test syncing 3 color tokens with generated PNG images
 */
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { uploadColorSwatchPng, extractHexColor } from './utils/colorSwatch';

dotenv.config();

const TEST_TOKENS = [
  { name: 'Sys/outline/error', color: '#ed7d70', collection: 'Sys' },
  { name: 'Sys/fill/success', color: '#4caf50', collection: 'Sys' },
  { name: 'Sys/bg/primary', color: '#1976d2', collection: 'Sys' },
];

async function testThreeColors() {
  console.log('🧪 Testing 3 color tokens with generated PNG images...\n');
  
  if (!process.env.IMGBB_API_KEY) {
    console.log('❌ IMGBB_API_KEY not found in .env file');
    console.log('   Please add your ImgBB API key to continue.');
    return;
  }
  
  const notion = new Client({ auth: process.env.NOTION_TOKEN! });
  const dbId = process.env.NOTION_DB_ID!.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const token of TEST_TOKENS) {
    console.log(`\n📦 Processing: ${token.name}`);
    console.log(`   Color: ${token.color}`);
    
    try {
      // Generate PNG and upload to ImgBB
      const hexColor = extractHexColor(token.color);
      if (!hexColor) {
        console.log(`   ❌ Invalid color format`);
        failureCount++;
        continue;
      }
      
      console.log(`   🎨 Generating PNG for color ${hexColor}...`);
      const fileName = `${token.name.replace(/[^a-zA-Z0-9]/g, '_')}-swatch.png`;
      const imageUrl = await uploadColorSwatchPng(hexColor, fileName);
      
      if (!imageUrl) {
        console.log(`   ❌ Failed to upload PNG`);
        failureCount++;
        continue;
      }
      
      console.log(`   ✅ Uploaded! URL: ${imageUrl.substring(0, 50)}...`);
      
      // Check if token exists in database
      const existing = await notion.databases.query({
        database_id: dbId,
        filter: {
          property: 'Name',
          title: {
            equals: token.name
          }
        }
      });
      
      if (existing.results.length > 0) {
        // Update existing
        const pageId = existing.results[0].id;
        console.log(`   📝 Updating existing page...`);
        
        await notion.pages.update({
          page_id: pageId,
          properties: {
            'Value': {
              rich_text: [{ text: { content: token.color } }]
            },
            'Resolved Value': {
              rich_text: [{ text: { content: token.color } }]
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
                    url: imageUrl
                  }
                }
              ]
            } as any
          }
        });
      } else {
        // Create new
        console.log(`   📝 Creating new page...`);
        
        await notion.pages.create({
          parent: { database_id: dbId },
          properties: {
            'Name': {
              title: [{ text: { content: token.name } }]
            },
            'Value': {
              rich_text: [{ text: { content: token.color } }]
            },
            'Category': {
              select: { name: 'Color' }
            },
            'Collection': {
              select: { name: token.collection }
            },
            'Mode': {
              select: { name: 'Light' }
            },
            'Type': {
              select: { name: 'Variable' }
            },
            'Resolved Value': {
              rich_text: [{ text: { content: token.color } }]
            },
            'Figma ID': {
              rich_text: [{ text: { content: `Test-${token.name}` } }]
            },
            'Figma Collection': {
              rich_text: [{ text: { content: token.collection } }]
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
      }
      
      console.log(`   ✅ Notion updated successfully!`);
      successCount++;
      
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
      failureCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Success: ${successCount}/${TEST_TOKENS.length} tokens`);
  console.log(`❌ Failed: ${failureCount}/${TEST_TOKENS.length} tokens`);
  console.log('='.repeat(50));
  
  if (successCount > 0) {
    console.log('\n👀 Please check your Notion database:');
    console.log('   1. Find the 3 test tokens');
    console.log('   2. Verify the Image column shows colored squares');
    console.log('   3. Check if colors match:');
    console.log('      - Sys/outline/error: Coral/salmon (#ed7d70)');
    console.log('      - Sys/fill/success: Green (#4caf50)');
    console.log('      - Sys/bg/primary: Blue (#1976d2)');
    console.log('\n⏳ If all 3 display correctly, we can sync all color tokens!');
  }
}

testThreeColors().catch(console.error);

