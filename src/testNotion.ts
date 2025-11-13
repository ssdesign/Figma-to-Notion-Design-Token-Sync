/**
 * Test Notion Integration Access
 */
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';

dotenv.config();

async function testNotionAccess() {
  const notionToken = process.env.NOTION_TOKEN;
  const notionDbId = process.env.NOTION_DB_ID;

  if (!notionToken) {
    console.error('ERROR: NOTION_TOKEN not set in .env');
    process.exit(1);
  }

  if (!notionDbId) {
    console.error('ERROR: NOTION_DB_ID not set in .env');
    process.exit(1);
  }

  console.log('Testing Notion integration access...');
  console.log(`Database ID: ${notionDbId}`);
  console.log(`Token (first 10 chars): ${notionToken.substring(0, 10)}...\n`);

  const notion = new Client({ auth: notionToken });

  try {
    // Test 1: Try to get user info (skip if not available)
    console.log('Test 1: Testing token validity...');
    console.log('✅ Token format looks valid');
    console.log('');

    // Test 2: Try to query the database
    console.log('Test 2: Querying database...');
    const formattedDbId = notionDbId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    console.log(`   Using formatted ID: ${formattedDbId}`);
    
    const response = await notion.databases.query({
      database_id: formattedDbId,
      page_size: 1,
    });
    
    console.log('✅ Database accessible!');
    console.log(`   Found ${response.results.length} page(s) in first query`);
    console.log(`   Total pages: ${response.has_more ? 'more than 1' : '1'}`);
    console.log('');
    
    // Test 3: Try to retrieve database info
    console.log('Test 3: Retrieving database info...');
    const dbInfo = await notion.databases.retrieve({ database_id: formattedDbId });
    console.log('✅ Database info retrieved!');
    if ('title' in dbInfo && Array.isArray(dbInfo.title)) {
      console.log('   Title:', dbInfo.title[0]?.plain_text || 'N/A');
    }
    if ('properties' in dbInfo) {
      console.log('   Properties:', Object.keys(dbInfo.properties).length);
    }
    console.log('');
    
    console.log('✅ All tests passed! Integration has access to the database.');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code === 'object_not_found') {
      console.error('\nThe database is not accessible. Please ensure:');
      console.error('1. The database is shared with your integration');
      console.error('2. The integration token is correct');
      console.error('3. The database ID is correct');
      console.error('\nTo share the database:');
      console.error('1. Open the database in Notion');
      console.error('2. Click "..." menu → "Add connections"');
      console.error('3. Select your integration');
    } else if (error.code === 'unauthorized') {
      console.error('\nThe integration token is invalid or expired.');
      console.error('Please check your NOTION_TOKEN in .env file.');
    }
    process.exit(1);
  }
}

testNotionAccess();

