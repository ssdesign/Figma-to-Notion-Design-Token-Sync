import { FigmaToken } from './models';
import { inferCategory } from './utils/categoryMapper';

const FIGMA_API_BASE = 'https://api.figma.com/v1';

/**
 * Figma API response types
 */
interface FigmaVariableCollection {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
}

interface FigmaVariable {
  id: string;
  name: string;
  variableCollectionId: string;
  resolvedType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
  valuesByMode: Record<string, unknown>;
  description?: string;
}

interface FigmaVariablesResponse {
  meta: {
    variableCollections: Record<string, FigmaVariableCollection>;
    variables: Record<string, FigmaVariable>;
  };
}

interface FigmaStyle {
  key: string;
  name: string;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  description?: string;
}

interface FigmaFileResponse {
  styles: Record<string, FigmaStyle>;
}

/**
 * Formats a variable value based on its type
 */
function formatVariableValue(value: unknown, type: string): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (type === 'COLOR') {
    // Color values can be RGBA objects or strings
    if (typeof value === 'object' && value !== null) {
      const rgba = value as { r: number; g: number; b: number; a?: number };
      const r = Math.round(rgba.r * 255);
      const g = Math.round(rgba.g * 255);
      const b = Math.round(rgba.b * 255);
      const a = rgba.a !== undefined ? rgba.a : 1;
      if (a < 1) {
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      }
      return `rgb(${r}, ${g}, ${b})`;
    }
    return String(value);
  }
  
  if (type === 'FLOAT') {
    return String(value);
  }
  
  return String(value);
}

/**
 * Fetches variables from a Figma file using the Variables API
 */
export async function fetchFigmaVariables(
  fileKey: string,
  token: string
): Promise<FigmaToken[]> {
  try {
    const url = `${FIGMA_API_BASE}/files/${fileKey}/variables/local`;
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Figma API error (${response.status}): ${errorText}`);
      return [];
    }

    const data = await response.json() as FigmaVariablesResponse;
    const tokens: FigmaToken[] = [];

    // Build a map of collection ID to collection name
    const collectionMap = new Map<string, string>();
    Object.values(data.meta.variableCollections).forEach((collection) => {
      collectionMap.set(collection.id, collection.name);
    });

    // Process each variable
    Object.values(data.meta.variables).forEach((variable) => {
      const collectionName = collectionMap.get(variable.variableCollectionId) || 'Unknown';
      
      // Get the first available mode
      const modeIds = Object.keys(variable.valuesByMode);
      if (modeIds.length === 0) {
        return; // Skip variables with no mode values
      }

      const firstModeId = modeIds[0];
      const collection = data.meta.variableCollections[variable.variableCollectionId];
      const modeName = collection?.modes.find(m => m.modeId === firstModeId)?.name || 'Default';
      
      const rawValue = variable.valuesByMode[firstModeId];
      const value = formatVariableValue(rawValue, variable.resolvedType);
      
      // Create a temporary token to infer category
      const tempToken: FigmaToken = {
        id: variable.id,
        name: variable.name,
        description: variable.description,
        collection: collectionName,
        mode: modeName,
        type: 'Variable',
        value: value,
        resolvedValue: value,
        category: 'Color', // Will be updated by inferCategory
      };
      
      tempToken.category = inferCategory(tempToken);
      
      tokens.push(tempToken);
    });

    return tokens;
  } catch (error) {
    console.error('Error fetching Figma variables:', error);
    return [];
  }
}

/**
 * Fetches styles from a Figma file
 */
export async function fetchFigmaStyles(
  fileKey: string,
  token: string
): Promise<FigmaToken[]> {
  try {
    const url = `${FIGMA_API_BASE}/files/${fileKey}`;
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Figma API error (${response.status}): ${errorText}`);
      return [];
    }

    const data = await response.json() as FigmaFileResponse;
    const tokens: FigmaToken[] = [];

    // Process each style
    Object.values(data.styles).forEach((style) => {
      // Create a temporary token to infer category
      const tempToken: FigmaToken = {
        id: style.key,
        name: style.name,
        description: style.description,
        collection: 'Styles', // Styles don't have collections in the same way
        mode: 'Default',
        type: 'Style',
        value: '', // Styles don't expose values directly via this endpoint
        resolvedValue: '',
        category: 'Color', // Will be updated by inferCategory
      };
      
      // Infer category based on style type and name
      if (style.styleType === 'FILL') {
        tempToken.category = 'Color';
      } else if (style.styleType === 'TEXT') {
        tempToken.category = 'Typography';
      } else if (style.styleType === 'EFFECT') {
        tempToken.category = 'Shadow';
      } else {
        tempToken.category = inferCategory(tempToken);
      }
      
      tokens.push(tempToken);
    });

    return tokens;
  } catch (error) {
    console.error('Error fetching Figma styles:', error);
    return [];
  }
}

/**
 * Fetches all design tokens (variables + styles) from a Figma file
 */
export async function fetchAllFigmaTokens(
  fileKey: string,
  token: string
): Promise<FigmaToken[]> {
  const [variables, styles] = await Promise.all([
    fetchFigmaVariables(fileKey, token),
    fetchFigmaStyles(fileKey, token),
  ]);

  return [...variables, ...styles];
}

