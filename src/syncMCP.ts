/**
 * MCP-based sync helper
 * 
 * This file provides a helper function that can be called from Cursor's context
 * where MCP tools are available. Use this when you want to sync using MCP tools
 * directly from Cursor's chat interface.
 * 
 * Example usage in Cursor:
 * 1. Open your Figma file and select the root page or a specific node
 * 2. In Cursor chat, ask to sync Figma tokens to Notion
 * 3. The AI assistant can call MCP tools and then call this sync function
 */

import { SyncResult } from './models';
import { upsertNotionTokens } from './notionClient';
import { fetchAllFigmaTokensMCP } from './figmaClientMCP';

/**
 * Syncs Figma tokens to Notion using MCP-provided data
 * 
 * This function is designed to be called after MCP tools have been invoked
 * to get variable definitions and metadata from Figma.
 * 
 * @param notionToken - Notion integration token
 * @param notionDbId - Notion database ID
 * @param nodeId - Optional Figma node ID
 * @param mcpVariableDefs - Variable definitions from mcp_Figma_Desktop_get_variable_defs
 * @param mcpMetadata - Metadata from mcp_Figma_Desktop_get_metadata (optional, for styles)
 */
export async function syncFigmaToNotionMCP(
  notionToken: string,
  notionDbId: string,
  nodeId?: string,
  mcpVariableDefs?: Record<string, unknown>,
  mcpMetadata?: any
): Promise<SyncResult> {
  console.log('Starting MCP-based sync from Figma to Notion...');
  
  if (nodeId) {
    console.log(`Figma Node ID: ${nodeId}`);
  } else {
    console.log('Using currently selected Figma node');
  }
  
  console.log(`Notion Database ID: ${notionDbId}`);

  // Fetch all tokens from Figma using MCP data
  console.log('Processing tokens from MCP...');
  const tokens = await fetchAllFigmaTokensMCP(nodeId, mcpVariableDefs, mcpMetadata);
  
  console.log(`Found ${tokens.length} tokens in Figma (${tokens.filter(t => t.type === 'Variable').length} variables, ${tokens.filter(t => t.type === 'Style').length} styles)`);

  if (tokens.length === 0) {
    console.warn('No tokens found. Make sure MCP tools returned data.');
    return {
      created: 0,
      updated: 0,
      total: 0,
    };
  }

  // Upsert tokens to Notion
  console.log('Syncing tokens to Notion...');
  const result = await upsertNotionTokens(tokens, notionDbId, notionToken);

  console.log('Sync complete!');
  return result;
}

