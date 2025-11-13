/**
 * Check Notion Database Schema
 */
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';

dotenv.config();

async function checkSchema() {
  const notionToken = process.env.NOTION_TOKEN;
  const notionDbId = process.env.NOTION_DB_ID;

  if (!notionToken || !notionDbId) {
    console.error('ERROR: NOTION_TOKEN and NOTION_DB_ID must be set');
    process.exit(1);
  }

  const notion = new Client({ auth: notionToken });
  const formattedDbId = notionDbId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');

  try {
    const dbInfo = await notion.databases.retrieve({ database_id: formattedDbId });
    
    console.log('Database Properties:\n');
    Object.entries(dbInfo.properties).forEach(([name, prop]: [string, any]) => {
      console.log(`${name}:`);
      console.log(`  Type: ${prop.type}`);
      if (prop.type === 'select' && prop.select) {
        console.log(`  Options: ${prop.select.options?.map((o: any) => o.name).join(', ') || 'N/A'}`);
      }
      console.log('');
    });
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();

