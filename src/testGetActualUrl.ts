/**
 * Test to retrieve the actual URL Notion uses for uploaded files
 */
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';

dotenv.config();

async function testGetActualUrl() {
  console.log('🔍 Checking what URL Notion actually uses for the uploaded file...\n');
  
  const notion = new Client({ auth: process.env.NOTION_TOKEN! });
  const dbId = process.env.NOTION_DB_ID!.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
  
  // Find the test page we just created
  const results = await notion.databases.query({
    database_id: dbId,
    filter: {
      property: 'Name',
      title: {
        equals: 'Sys/outline/error'
      }
    }
  });
  
  if (results.results.length === 0) {
    console.log('❌ Test page not found. Run testSingleColorSync.ts first.');
    return;
  }
  
  const page = results.results[0] as any;
  const pageId = page.id;
  
  console.log(`Found page: ${pageId}`);
  
  // Retrieve the full page to see the actual file URL
  const fullPage = await notion.pages.retrieve({ page_id: pageId });
  
  console.log('\n📄 Full page properties:');
  console.log(JSON.stringify((fullPage as any).properties.Image, null, 2));
  
  // Check if Notion transformed our URL
  const imageProperty = (fullPage as any).properties.Image;
  if (imageProperty && imageProperty.files && imageProperty.files.length > 0) {
    const file = imageProperty.files[0];
    console.log('\n📸 Image file details:');
    console.log(`   Type: ${file.type}`);
    console.log(`   Name: ${file.name}`);
    
    if (file.external) {
      console.log(`   External URL: ${file.external.url}`);
    }
    if (file.file) {
      console.log(`   File URL: ${file.file.url}`);
      console.log(`   Expiry: ${file.file.expiry_time}`);
    }
  }
}

testGetActualUrl().catch(console.error);

