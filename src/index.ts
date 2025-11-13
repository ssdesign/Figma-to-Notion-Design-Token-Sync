import dotenv from 'dotenv';
import { SyncConfig } from './models';
import { syncFigmaToNotion } from './sync';

// Load environment variables from .env file
dotenv.config();

/**
 * Validates that all required environment variables are present
 */
function validateConfig(): SyncConfig {
  const useMCP = process.env.USE_MCP === 'true';
  const figmaToken = process.env.FIGMA_TOKEN;
  const figmaFileKey = process.env.FIGMA_FILE_KEY;
  const figmaNodeId = process.env.FIGMA_NODE_ID;
  const notionToken = process.env.NOTION_TOKEN;
  const notionDbId = process.env.NOTION_DB_ID;

  const missing: string[] = [];

  if (!notionToken) {
    missing.push('NOTION_TOKEN');
  }
  if (!notionDbId) {
    missing.push('NOTION_DB_ID');
  }

  if (useMCP) {
    // MCP mode: nodeId is optional (can use current selection)
    console.log('MCP mode enabled');
  } else {
    // REST API mode: require token and file key
    if (!figmaToken) {
      missing.push('FIGMA_TOKEN');
    }
    if (!figmaFileKey) {
      missing.push('FIGMA_FILE_KEY');
    }
  }

  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach((varName) => {
      console.error(`  - ${varName}`);
    });
    console.error('\nPlease create a .env file with these variables. See .env.example for reference.');
    if (useMCP) {
      console.error('\nNote: For MCP mode, you only need NOTION_TOKEN and NOTION_DB_ID.');
      console.error('FIGMA_NODE_ID is optional - if not provided, will use currently selected node.');
    }
    process.exit(1);
  }

  return {
    figmaToken: figmaToken || undefined,
    figmaFileKey: figmaFileKey || undefined,
    figmaNodeId: figmaNodeId || undefined,
    notionToken: notionToken!,
    notionDbId: notionDbId!,
    useMCP: useMCP || false,
  };
}

/**
 * Main entry point
 */
async function main() {
  try {
    const config = validateConfig();
    const result = await syncFigmaToNotion(config);

    console.log('\n=== Sync Summary ===');
    console.log(`Total tokens processed: ${result.total}`);
    console.log(`Created: ${result.created}`);
    console.log(`Updated: ${result.updated}`);
    console.log('===================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error during sync:', error);
    process.exit(1);
  }
}

// Run the sync
main();

