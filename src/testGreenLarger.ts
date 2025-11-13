/**
 * Try uploading a larger green image (maybe 100x100 is too small?)
 */
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';

dotenv.config();

async function testGreenLarger() {
  console.log('🧪 Testing with a 200x200px green image...\n');
  
  if (!process.env.IMGBB_API_KEY) {
    console.log('❌ IMGBB_API_KEY not found');
    return;
  }
  
  // Generate 200x200 green square
  const sharp = (await import('sharp')).default;
  const pngBuffer = await sharp({
    create: {
      width: 200,
      height: 200,
      channels: 3,
      background: { r: 76, g: 175, b: 80 } // #4caf50
    }
  })
  .png()
  .toBuffer();
  
  console.log(`Generated 200x200 PNG: ${pngBuffer.length} bytes`);
  
  // Upload to ImgBB
  console.log('📤 Uploading to ImgBB...');
  const base64Image = pngBuffer.toString('base64');
  const body = new URLSearchParams();
  body.append('image', base64Image);
  
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  
  if (!response.ok) {
    console.log(`❌ Upload failed: ${response.status}`);
    return;
  }
  
  const data = await response.json() as any;
  const imageUrl = data.data?.display_url || data.data?.url;
  
  console.log(`✅ Uploaded! URL: ${imageUrl}`);
  console.log(`\n🔗 Test this URL in your browser: ${imageUrl}`);
  
  // Update Notion
  console.log('\n📝 Updating Notion...');
  const notion = new Client({ auth: process.env.NOTION_TOKEN! });
  const dbId = process.env.NOTION_DB_ID!.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
  
  const results = await notion.databases.query({
    database_id: dbId,
    filter: {
      property: 'Name',
      title: {
        equals: 'Sys/fill/success'
      }
    }
  });
  
  if (results.results.length > 0) {
    const pageId = results.results[0].id;
    
    await notion.pages.update({
      page_id: pageId,
      properties: {
        'Image': {
          files: [
            {
              name: 'green-200x200.png',
              type: 'external',
              external: {
                url: imageUrl
              }
            }
          ]
        } as any
      }
    });
    
    console.log('✅ Notion updated!');
    console.log('\n👀 Check your Notion database now.');
  }
}

testGreenLarger().catch(console.error);

