/**
 * Debug the green color that failed
 */
import dotenv from 'dotenv';
import { uploadColorSwatchPng, extractHexColor } from './utils/colorSwatch';
import * as fs from 'fs';

dotenv.config();

async function testSingleGreen() {
  console.log('🔍 Debugging green color #4caf50...\n');
  
  const hexColor = '#4caf50';
  
  // Test hex extraction
  const extracted = extractHexColor(hexColor);
  console.log(`Extracted hex: ${extracted}`);
  
  // Generate the PNG locally first
  const sharp = (await import('sharp')).default;
  
  // Parse hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  console.log(`RGB values: r=${r}, g=${g}, b=${b}`);
  
  // Generate PNG
  const pngBuffer = await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r, g, b }
    }
  })
  .png()
  .toBuffer();
  
  console.log(`PNG buffer size: ${pngBuffer.length} bytes`);
  
  // Save locally to verify
  fs.writeFileSync('test-green.png', pngBuffer);
  console.log(`✅ Saved test-green.png locally (check if it looks green)`);
  
  // Now try uploading
  console.log('\n📤 Uploading to ImgBB...');
  const imageUrl = await uploadColorSwatchPng(hexColor, 'test-green.png');
  
  if (imageUrl) {
    console.log(`✅ Upload successful!`);
    console.log(`   URL: ${imageUrl}`);
    console.log('\n🔗 Try opening this URL in your browser:');
    console.log(`   ${imageUrl}`);
    console.log('\n   Does it show a green square?');
  } else {
    console.log(`❌ Upload failed`);
  }
}

testSingleGreen().catch(console.error);

