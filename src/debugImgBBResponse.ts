/**
 * Debug ImgBB response to see all available URLs
 */
import dotenv from 'dotenv';

dotenv.config();

async function debugImgBBResponse() {
  console.log('🔍 Checking ImgBB response structure...\n');
  
  if (!process.env.IMGBB_API_KEY) {
    console.log('❌ IMGBB_API_KEY not found');
    return;
  }
  
  // Generate a simple test image (red square)
  const sharp = (await import('sharp')).default;
  const pngBuffer = await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r: 255, g: 0, b: 0 }
    }
  })
  .png()
  .toBuffer();
  
  console.log('📤 Uploading test image to ImgBB...');
  
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
  
  console.log('\n📋 Full ImgBB Response:');
  console.log(JSON.stringify(data, null, 2));
  
  console.log('\n🔗 Available URLs:');
  if (data.data) {
    console.log(`   url: ${data.data.url}`);
    console.log(`   display_url: ${data.data.display_url}`);
    console.log(`   url_viewer: ${data.data.url_viewer}`);
    
    if (data.data.image) {
      console.log(`   image.url: ${data.data.image.url}`);
    }
    if (data.data.thumb) {
      console.log(`   thumb.url: ${data.data.thumb.url}`);
    }
    if (data.data.medium) {
      console.log(`   medium.url: ${data.data.medium.url}`);
    }
  }
  
  console.log('\n💡 Which URL should we use for Notion?');
}

debugImgBBResponse().catch(console.error);

