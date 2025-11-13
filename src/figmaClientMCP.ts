import { FigmaToken } from './models';
import { inferCategory } from './utils/categoryMapper';

/**
 * MCP-based Figma client using MCP tools
 * 
 * IMPORTANT: MCP tools are available in Cursor's AI context, not directly from Node.js.
 * To use MCP mode, you have two options:
 * 
 * Option 1: Run from Cursor's chat/command interface where MCP tools are available
 * Option 2: Set up an MCP client library to connect to the Figma MCP server
 * 
 * For now, this implementation provides the structure but requires MCP tools
 * to be called externally or through an MCP client.
 */

/**
 * MCP tool interface - matches the structure of MCP tools available in Cursor
 */
interface MCPTool {
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * Formats a variable value based on its type
 */
function formatVariableValue(value: unknown, type: string): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (type === 'COLOR' || type === 'color') {
    // Color values can be RGBA objects, hex strings, or CSS color names
    if (typeof value === 'object' && value !== null) {
      const rgba = value as { r?: number; g?: number; b?: number; a?: number };
      if (rgba.r !== undefined && rgba.g !== undefined && rgba.b !== undefined) {
        const r = Math.round(rgba.r * 255);
        const g = Math.round(rgba.g * 255);
        const b = Math.round(rgba.b * 255);
        const a = rgba.a !== undefined ? rgba.a : 1;
        if (a < 1) {
          return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    // If it's a string (hex, CSS color name, etc.), return as-is
    return String(value);
  }
  
  if (type === 'FLOAT' || type === 'float' || type === 'number') {
    return String(value);
  }
  
  return String(value);
}

/**
 * Processes variable definitions from MCP get_variable_defs response
 * Expected format: { 'variable/name': '#FF0000', ... }
 */
function processVariableDefs(
  variableDefs: Record<string, unknown>,
  nodeId?: string
): FigmaToken[] {
  const tokens: FigmaToken[] = [];
  
  Object.entries(variableDefs).forEach(([key, value]) => {
    // Parse variable name and collection from key (e.g., "collection/variable" or "variable")
    const parts = key.split('/');
    const collection = parts.length > 1 ? parts[0] : 'Global';
    const name = parts.length > 1 ? parts.slice(1).join('/') : key;
    
    // Infer type from value
    let type = 'COLOR';
    if (typeof value === 'number') {
      type = 'FLOAT';
    } else if (typeof value === 'string') {
      // Check if it's a color (hex, rgb, etc.)
      if (value.startsWith('#') || value.startsWith('rgb')) {
        type = 'COLOR';
      }
    }
    
    const valueStr = formatVariableValue(value, type);
    
    const tempToken: FigmaToken = {
      id: `var_${key}`, // Use key as ID
      name: name,
      description: undefined,
      collection: collection,
      mode: 'Default', // MCP might not provide mode info
      type: 'Variable',
      value: valueStr,
      resolvedValue: valueStr,
      category: 'Color',
    };
    
    tempToken.category = inferCategory(tempToken);
    tokens.push(tempToken);
  });
  
  return tokens;
}

/**
 * Fetches variables from Figma using MCP
 * Uses mcp_Figma_Desktop_get_variable_defs to get variable definitions
 * 
 * NOTE: This function expects to receive MCP tool results. In a real implementation,
 * you would call the MCP tool and pass the results here, or use an MCP client.
 */
export async function fetchFigmaVariablesMCP(
  nodeId?: string,
  mcpVariableDefs?: Record<string, unknown>
): Promise<FigmaToken[]> {
  try {
    if (mcpVariableDefs) {
      // Process provided variable definitions
      return processVariableDefs(mcpVariableDefs, nodeId);
    }
    
    // If no MCP data provided, return empty array
    // In a real implementation, you would call the MCP tool here:
    // const result = await callMCPTool('mcp_Figma_Desktop_get_variable_defs', { nodeId });
    // return processVariableDefs(result, nodeId);
    
    console.warn('MCP variable definitions not provided. MCP tools must be called externally.');
    console.warn('To use MCP mode, call mcp_Figma_Desktop_get_variable_defs and pass the result.');
    return [];
  } catch (error) {
    console.error('Error fetching Figma variables via MCP:', error);
    return [];
  }
}

/**
 * Processes styles from MCP metadata or design context
 */
function processStylesFromMetadata(metadata: any): FigmaToken[] {
  const tokens: FigmaToken[] = [];
  
  // This is a placeholder - actual implementation would parse MCP metadata
  // to extract style information
  
  return tokens;
}

/**
 * Fetches styles from Figma using MCP
 * Uses mcp_Figma_Desktop_get_metadata or get_design_context to get styles
 */
export async function fetchFigmaStylesMCP(
  nodeId?: string,
  mcpMetadata?: any
): Promise<FigmaToken[]> {
  try {
    if (mcpMetadata) {
      return processStylesFromMetadata(mcpMetadata);
    }
    
    console.warn('MCP metadata not provided. MCP tools must be called externally.');
    return [];
  } catch (error) {
    console.error('Error fetching Figma styles via MCP:', error);
    return [];
  }
}

/**
 * Fetches all design tokens (variables + styles) from Figma using MCP
 * 
 * @param nodeId - Optional Figma node ID (e.g., "0:1" for page root)
 * @param mcpVariableDefs - Optional: Variable definitions from MCP get_variable_defs
 * @param mcpMetadata - Optional: Metadata from MCP get_metadata
 */
export async function fetchAllFigmaTokensMCP(
  nodeId?: string,
  mcpVariableDefs?: Record<string, unknown>,
  mcpMetadata?: any
): Promise<FigmaToken[]> {
  const [variables, styles] = await Promise.all([
    fetchFigmaVariablesMCP(nodeId, mcpVariableDefs),
    fetchFigmaStylesMCP(nodeId, mcpMetadata),
  ]);

  return [...variables, ...styles];
}

