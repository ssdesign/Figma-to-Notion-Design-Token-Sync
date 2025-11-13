/**
 * MCP Sync Helper - To be run from Cursor's AI context
 * 
 * This script calls MCP tools and then syncs to Notion.
 * Run this by asking the AI: "Run the MCP sync script"
 * 
 * The AI will:
 * 1. Call mcp_Figma_Desktop_get_variable_defs
 * 2. Call mcp_Figma_Desktop_get_metadata (if needed for styles)
 * 3. Call syncFigmaToNotionMCP with the results
 */

import dotenv from 'dotenv';
import { syncFigmaToNotionMCP } from './syncMCP';

dotenv.config();

/**
 * Main function to be called by AI assistant
 * The AI should call MCP tools first, then call this function with the results
 */
export async function runMCPSync(
  mcpVariableDefs: Record<string, unknown>,
  mcpMetadata?: any,
  nodeId?: string
): Promise<void> {
  const notionToken = process.env.NOTION_TOKEN;
  const notionDbId = process.env.NOTION_DB_ID;
  const figmaNodeId = process.env.FIGMA_NODE_ID || nodeId;

  if (!notionToken || !notionDbId) {
    throw new Error('NOTION_TOKEN and NOTION_DB_ID must be set in .env file');
  }

  console.log('Running MCP-based sync...');
  const result = await syncFigmaToNotionMCP(
    notionToken,
    notionDbId,
    figmaNodeId,
    mcpVariableDefs,
    mcpMetadata
  );

  console.log('\n=== Sync Summary ===');
  console.log(`Total tokens processed: ${result.total}`);
  console.log(`Created: ${result.created}`);
  console.log(`Updated: ${result.updated}`);
  console.log('===================\n');
}

