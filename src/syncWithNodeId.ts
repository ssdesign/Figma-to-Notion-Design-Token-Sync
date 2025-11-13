/**
 * Sync with specific Node ID
 * Usage: npx ts-node src/syncWithNodeId.ts <nodeId>
 * Example: npx ts-node src/syncWithNodeId.ts 119:1410
 */

import dotenv from 'dotenv';
import { syncFigmaToNotionMCP } from './syncMCP';
import { mcp_Figma_Desktop_get_variable_defs } from './mcpHelpers';

dotenv.config();

async function main() {
  // Get node ID from command line argument
  const nodeIdArg = process.argv[2];
  
  if (!nodeIdArg) {
    console.error('Usage: npx ts-node src/syncWithNodeId.ts <nodeId>');
    console.error('Example: npx ts-node src/syncWithNodeId.ts 119:1410');
    console.error('\nTo get node ID from Figma URL:');
    console.error('  URL: https://www.figma.com/design/...?node-id=119-1410');
    console.error('  Convert: 119-1410 → 119:1410 (replace - with :)');
    process.exit(1);
  }

  // Convert node ID format if needed (119-1410 → 119:1410)
  const nodeId = nodeIdArg.replace(/-/g, ':');
  
  const notionToken = process.env.NOTION_TOKEN;
  const notionDbId = process.env.NOTION_DB_ID;

  if (!notionToken || !notionDbId) {
    console.error('ERROR: NOTION_TOKEN and NOTION_DB_ID must be set in .env file');
    process.exit(1);
  }

  console.log(`Fetching variables for node: ${nodeId}`);
  console.log('(Make sure this node is selected in Figma desktop app)\n');

  try {
    // Note: In a real implementation, you would call the MCP tool here
    // For now, you need to manually call mcp_Figma_Desktop_get_variable_defs
    // and pass the result, or update this script to call MCP tools directly
    
    console.log('To use this script with MCP:');
    console.log('1. Open your Figma file');
    console.log('2. Select the node you want to sync');
    console.log('3. Ask the AI assistant to sync with this node ID');
    console.log('\nOr update this script to call MCP tools directly.');
    
    // Placeholder - you would call MCP tool here:
    // const variableDefs = await callMCPTool('mcp_Figma_Desktop_get_variable_defs', { nodeId });
    // Then sync:
    // const result = await syncFigmaToNotionMCP(notionToken, notionDbId, nodeId, variableDefs);
    
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

