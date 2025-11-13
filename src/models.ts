/**
 * Shared type definitions for Figma tokens and Notion properties
 */

/**
 * Normalized representation of a design token from Figma
 */
export interface FigmaToken {
  id: string; // Figma variable/style ID
  name: string;
  description?: string;
  collection: string; // Figma collection name
  mode: string; // e.g., "Light", "Dark", "Default"
  type: 'Variable' | 'Style';
  value: string; // Raw token value (hex, px, number, etc.)
  resolvedValue: string; // Same as value for now; later could handle mode-resolved values
  category: string; // Color, Typography, Spacing, Sizing, Radius, Shadow, Opacity, Elevation
}

/**
 * Configuration for the sync operation
 */
export interface SyncConfig {
  figmaToken?: string; // Optional if using MCP
  figmaFileKey?: string; // Optional if using MCP with nodeId
  figmaNodeId?: string; // Optional: Figma node ID for MCP (e.g., "0:1" for page root)
  notionToken: string;
  notionDbId: string;
  useMCP?: boolean; // Whether to use MCP instead of REST API
}

/**
 * Result of a sync operation
 */
export interface SyncResult {
  created: number;
  updated: number;
  total: number;
}

/**
 * Notion page ID mapped by Figma ID
 */
export type NotionPageMap = Map<string, string>;

