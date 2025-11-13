/**
 * Test uploading an existing PNG file to verify the upload mechanism works
 */
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function uploadToImgBB(imageBuffer: Buffer, apiKey: string): Promise<string | null> {
  try {
    // Use URL-encoded form data instead of multipart/form-data
    const base64Image = imageBuffer.toString('base64');
    const body = new URLSearchParams();
    body.append('image', base64Image);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`ImgBB failed: ${response.status}`);
      console.log(`Error: ${errorText.substring(0, 200)}`);
      return null;
    }
    
    const data = await response.json() as any;
    console.log(`ImgBB response: ${JSON.stringify(data).substring(0, 200)}`);
    return data.data?.url || null;
  } catch (error: any) {
    console.log(`ImgBB error: ${error.message}`);
    return null;
  }
}

async function uploadToPostimages(imageBuffer: Buffer): Promise<string | null> {
  try {
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('upload', imageBuffer, {
      filename: 'test.png',
      contentType: 'image/png',
    });
    formData.append('token', 'default');
    
    const response = await fetch('https://postimages.org/json/rr', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Postimages failed: ${response.status}`);
      console.log(`Error: ${errorText.substring(0, 300)}`);
      return null;
    }
    
    const data = await response.json() as any;
    console.log('Postimages response:', JSON.stringify(data, null, 2).substring(0, 300));
    return data.url || null;
  } catch (error: any) {
    console.log(`Postimages error: ${error.message}`);
    return null;
  }
}

async function testUploadExistingImage() {
  console.log('🧪 Testing upload with existing 1px PNG image...\n');
  
  // Look for the image file (you can specify the path)
  const possiblePaths = [
    path.join(__dirname, '..', 'test-image.png'),
    path.join(__dirname, '..', 'image.png'),
    path.join(__dirname, '..', '1px.png'),
    path.join(process.cwd(), 'test-image.png'),
    path.join(process.cwd(), 'image.png'),
    path.join(process.cwd(), '1px.png'),
  ];
  
  let imagePath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      imagePath = p;
      break;
    }
  }
  
  if (!imagePath) {
    console.log('❌ Image file not found. Please save your 1px PNG as one of:');
    possiblePaths.forEach(p => console.log(`   - ${p}`));
    console.log('\nOr specify the path manually in the script.');
    return;
  }
  
  console.log(`📁 Found image: ${imagePath}`);
  
  // Read the image file
  const imageBuffer = fs.readFileSync(imagePath);
  console.log(`📊 Image size: ${imageBuffer.length} bytes`);
  
  // Try uploading to different services
  let uploadedUrl: string | null = null;
  
  // Try ImgBB if API key is available
  const imgbbKey = process.env.IMGBB_API_KEY;
  if (imgbbKey) {
    console.log('\n📤 Trying ImgBB...');
    uploadedUrl = await uploadToImgBB(imageBuffer, imgbbKey);
    if (uploadedUrl) {
      console.log('✅ ImgBB upload successful!');
      console.log(`   URL: ${uploadedUrl}`);
    }
  }
  
  // Try Postimages as fallback
  if (!uploadedUrl) {
    console.log('\n📤 Trying Postimages...');
    uploadedUrl = await uploadToPostimages(imageBuffer);
    if (uploadedUrl) {
      console.log('✅ Postimages upload successful!');
      console.log(`   URL: ${uploadedUrl}`);
    }
  }
  
  if (!uploadedUrl) {
    console.log('\n❌ All upload services failed.');
    console.log('💡 Try setting IMGBB_API_KEY in your .env file');
    console.log('   Get a free API key from: https://api.imgbb.com/');
    return;
  }
  
  // Now update Notion with this image
  console.log('\n📝 Updating Notion database...');
  const notion = new Client({ auth: process.env.NOTION_TOKEN! });
  const dbId = process.env.NOTION_DB_ID!.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
  
  const tokenName = 'Sys/outline/error';
  const results = await notion.databases.query({
    database_id: dbId,
    filter: {
      property: 'Name',
      title: {
        equals: tokenName
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
              name: 'test-1px.png',
              type: 'external',
              external: {
                url: uploadedUrl
              }
            }
          ]
        } as any
      }
    });
    
    console.log('✅ Notion page updated!');
    console.log('\n👀 Please check your Notion database:');
    console.log(`   1. Find the "${tokenName}" row`);
    console.log('   2. Check if the Image column shows the uploaded image');
    console.log('   3. If it works, the issue was with image generation, not uploading!');
  } else {
    console.log(`❌ Token "${tokenName}" not found in database.`);
    console.log('   Run testSingleColorSync.ts first to create it.');
  }
}

testUploadExistingImage().catch(console.error);

