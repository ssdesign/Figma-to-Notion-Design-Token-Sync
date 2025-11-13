import { SyncConfig, SyncResult } from './models';
import { fetchAllFigmaTokens } from './figmaClient';
import { fetchAllFigmaTokensMCP } from './figmaClientMCP';
import { upsertNotionTokens } from './notionClient';

/**
 * Synchronizes Figma design tokens to Notion database
 * Fetches all tokens from Figma (variables + styles) and upserts them to Notion
 * Supports both REST API and MCP modes
 */
export async function syncFigmaToNotion(config: SyncConfig): Promise<SyncResult> {
  console.log('Starting sync from Figma to Notion...');
  
  if (config.useMCP) {
    console.log('Using MCP mode');
    if (config.figmaNodeId) {
      console.log(`Figma Node ID: ${config.figmaNodeId}`);
    } else {
      console.log('Using currently selected Figma node (if available)');
    }
  } else {
    console.log('Using REST API mode');
    console.log(`Figma File Key: ${config.figmaFileKey}`);
  }
  
  console.log(`Notion Database ID: ${config.notionDbId}`);

  // Fetch all tokens from Figma
  console.log('Fetching tokens from Figma...');
  let tokens: import('./models').FigmaToken[];
  
  if (config.useMCP) {
    // MCP mode: tools must be called from Cursor's AI context
    // The CLI cannot call MCP tools directly
    console.error('\n❌ ERROR: MCP mode cannot be used from CLI.');
    console.error('MCP tools are only available in Cursor\'s AI context.');
    console.error('\nTo use MCP mode, please:');
    console.error('1. Open your Figma file in the Figma desktop app');
    console.error('2. Select the root page or a node with variables');
    console.error('3. Ask the AI assistant in Cursor: "Sync Figma tokens to Notion using MCP"');
    console.error('\nAlternatively, use REST API mode by setting USE_MCP=false in .env\n');
    throw new Error('MCP mode requires AI assistant context. Use REST API mode for CLI, or ask AI to sync.');
  } else {
    if (!config.figmaFileKey || !config.figmaToken) {
      throw new Error('FIGMA_FILE_KEY and FIGMA_TOKEN are required when not using MCP mode');
    }
    tokens = await fetchAllFigmaTokens(config.figmaFileKey, config.figmaToken);
  }
  
  console.log(`Found ${tokens.length} tokens in Figma (${tokens.filter(t => t.type === 'Variable').length} variables, ${tokens.filter(t => t.type === 'Style').length} styles)`);

  if (tokens.length === 0) {
    console.warn('No tokens found in Figma. Check your configuration.');
    return {
      created: 0,
      updated: 0,
      total: 0,
    };
  }

  // Upsert tokens to Notion
  console.log('Syncing tokens to Notion...');
  const result = await upsertNotionTokens(tokens, config.notionDbId, config.notionToken);

  console.log('Sync complete!');
  return result;
}

