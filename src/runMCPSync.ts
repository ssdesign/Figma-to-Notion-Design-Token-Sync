/**
 * Run MCP Sync - Execute this from Cursor's AI context
 * 
 * This script processes MCP tool results and syncs to Notion
 */

import dotenv from 'dotenv';
import { syncFigmaToNotionMCP } from './syncMCP';

dotenv.config();

// Variable definitions from MCP get_variable_defs for node 3049:19912
// This node contains 195 variables - much more comprehensive!
const mcpVariableDefs: Record<string, unknown> = {
  "hE/Sys/on-surface/primary": "#2e2e2e",
  "Font/Letter spacing/xs_boomi_only": "0",
  "Font/Size/5xl": "44",
  "Font/Weight/Regular": "Regular",
  "Font/Family/Display": "Inter",
  "Font/Line height/2xl": "48",
  "Display/Large": "Font(family: \"Inter\", style: Regular, size: 44, weight: 400, lineHeight: 48)",
  "Font/Size/3xl": "36",
  "Font/Line height/xl": "44",
  "Display/Small": "Font(family: \"Inter\", style: Regular, size: 36, weight: 400, lineHeight: 44)",
  "Font/Size/3xs": "10",
  "Font/Family/Body-Medium": "Inter",
  "Font/Line height/3xs": "16",
  "Body/Tiny": "Font(family: \"Inter\", style: Regular, size: 10, weight: 400, lineHeight: 16)",
  "hE/Sys/outline/primary": "#cccccc",
  "Font/Size/4xl": "40",
  "Display/Medium": "Font(family: \"Inter\", style: Regular, size: 40, weight: 400, lineHeight: 48)",
  "Font/Size/6xl": "56",
  "Font/Line height/3xl": "60",
  "Display/X-Large": "Font(family: \"Inter\", style: Regular, size: 56, weight: 400, lineHeight: 60)",
  "Font/Size/md": "20",
  "Font/Family/Header": "Inter",
  "Font/Line height/sm": "28",
  "Header/Small": "Font(family: \"Inter\", style: Regular, size: 20, weight: 400, lineHeight: 28)",
  "Font/Size/lg": "24",
  "Font/Line height/base": "32",
  "Header/Medium": "Font(family: \"Inter\", style: Regular, size: 24, weight: 400, lineHeight: 32)",
  "Font/Size/xl": "28",
  "Font/Line height/md": "36",
  "Header/Large": "Font(family: \"Inter\", style: Regular, size: 28, weight: 400, lineHeight: 36)",
  "Font/Size/2xl": "32",
  "Font/Line height/lg": "40",
  "Header/X-Large": "Font(family: \"Inter\", style: Regular, size: 32, weight: 400, lineHeight: 40)",
  "Font/Weight/Italic": "Italic",
  "Body/Tiny-Italic": "Font(family: \"Inter\", style: Italic, size: 10, weight: 400, lineHeight: 16)",
  "Font/Size/2xs": "12",
  "Body/Small": "Font(family: \"Inter\", style: Regular, size: 12, weight: 400, lineHeight: 16)",
  "Font/Size/sm": "16",
  "Font/Line height/2xs": "20",
  "Body/Large": "Font(family: \"Inter\", style: Regular, size: 16, weight: 400, lineHeight: 20)",
  "Font/Size/base": "18",
  "Font/Line height/xs": "24",
  "Body/X-Large": "Font(family: \"Inter\", style: Regular, size: 18, weight: 400, lineHeight: 24)",
  "Font/Letter spacing/base": "0",
  "Font/Weight/Bold": "Bold",
  "Font/Family/Body-Bold": "Inter",
  "Body-Bold/Tiny": "Font(family: \"Inter\", style: Bold, size: 10, weight: 700, lineHeight: 16)",
  "Body-Bold/Tiny-Italic": "Font(family: \"Inter\", style: Bold Italic, size: 10, weight: 700, lineHeight: 16)",
  "Body-Bold/Small": "Font(family: \"Inter\", style: Bold, size: 12, weight: 700, lineHeight: 16)",
  "Font/Size/xs": "14",
  "Body-Bold/Medium": "Font(family: \"Inter\", style: Bold, size: 14, weight: 700, lineHeight: 20)",
  "Body-Bold/Large": "Font(family: \"Inter\", style: Bold, size: 16, weight: 700, lineHeight: 20)",
  "Body-Bold/X-Large": "Font(family: \"Inter\", style: Bold, size: 18, weight: 700, lineHeight: 24)",
  "Font/Family/Table-mono": "Roboto Mono",
  "Table-mono/Tiny": "Font(family: \"Roboto Mono\", style: Regular, size: 10, weight: 400, lineHeight: 16)",
  "Table-mono/Small": "Font(family: \"Roboto Mono\", style: Regular, size: 12, weight: 400, lineHeight: 16)",
  "Table-mono/Medium": "Font(family: \"Roboto Mono\", style: Regular, size: 14, weight: 400, lineHeight: 20)",
  "Table-mono/Large": "Font(family: \"Roboto Mono\", style: Regular, size: 16, weight: 400, lineHeight: 20)",
  "Table-mono/X-Large": "Font(family: \"Roboto Mono\", style: Regular, size: 18, weight: 400, lineHeight: 24)",
  "Font/Letter spacing/sm_boomi_only": "0",
  "Font/Weight/Medium": "Medium",
  "Font/Family/Label": "Inter",
  "Label/Tiny": "Font(family: \"Inter\", style: Medium, size: 10, weight: 500, lineHeight: 16)",
  "Label/Small": "Font(family: \"Inter\", style: Medium, size: 12, weight: 500, lineHeight: 16)",
  "Label/Medium": "Font(family: \"Inter\", style: Medium, size: 14, weight: 500, lineHeight: 20)",
  "Label/Large": "Font(family: \"Inter\", style: Medium, size: 16, weight: 500, lineHeight: 20)",
  "Font/Family/Link": "Inter",
  "Link/Small": "Font(family: \"Inter\", style: Medium, size: 12, weight: 500, lineHeight: 16)",
  "Link/Medium": "Font(family: \"Inter\", style: Medium, size: 14, weight: 500, lineHeight: 20)",
  "Link/Large": "Font(family: \"Inter\", style: Medium, size: 16, weight: 500, lineHeight: 20)",
  "hE/Sys/on-surface/inverted": "#ffffff",
  "hE/Core/grey/80": "#4d4d4d",
  "Font/Family/Title": "Inter",
  "Title/Tiny": "Font(family: \"Inter\", style: Medium, size: 14, weight: 500, lineHeight: 20)",
  "Title/Small": "Font(family: \"Inter\", style: Medium, size: 18, weight: 500, lineHeight: 24)",
  "Title/Medium": "Font(family: \"Inter\", style: Medium, size: 20, weight: 500, lineHeight: 28)",
  "Title/Large": "Font(family: \"Inter\", style: Medium, size: 24, weight: 500, lineHeight: 32)",
  "hE/Sys/outline/variant": "#4d4d4d",
  "semantic/state/ce/space04": "4",
  "semantic/state/ce/space08": "8",
  "semantic/state/ce/space12": "12",
  "semantic/state/ce/space16": "16",
  "semantic/state/ce/space20": "20",
  "semantic/state/ce/space28": "28",
  "semantic/state/ce/space64": "64",
  "semantic/state/ce/space72": "72",
  "hE/Dataviz/categorical/01": "#2998bd",
  "hE/Dataviz/categorical/02": "#5f4db2",
  "hE/Dataviz/categorical/03": "#e56910",
  "hE/Dataviz/categorical/04": "#943d73",
  "hE/Dataviz/categorical/05": "#0a326c",
  "hE/Dataviz/categorical/06": "#8f7ee7",
  "hE/Dataviz/categorical/07": "#50253f",
  "hE/Dataviz/categorical/08": "#a54800",
  "hE/Dataviz/categorical/09": "#8590a2",
  "hE/Dataviz/categorical/10": "#946f00",
  "hE/Dataviz/categorical/11": "#216e4e",
  "hE/Dataviz/categorical/12": "#0055cc",
  "hE/Sys/surface-container/primary": "#ffffff",
  "hE/Dataviz/sequential/viridis/01": "#fde725",
  "hE/Dataviz/sequential/viridis/02": "#d2e21b",
  "hE/Dataviz/sequential/viridis/03": "#a5db36",
  "hE/Dataviz/sequential/viridis/04": "#7ad151",
  "hE/Dataviz/sequential/viridis/05": "#54c568",
  "hE/Dataviz/sequential/viridis/06": "#43a047",
  "hE/Dataviz/sequential/viridis/07": "#06967d",
  "hE/Dataviz/sequential/viridis/08": "#0097a7",
  "hE/Dataviz/sequential/viridis/09": "#3c8ca5",
  "hE/Dataviz/sequential/viridis/10": "#327da8",
  "hE/Dataviz/sequential/viridis/11": "#3879c6",
  "hE/Dataviz/sequential/viridis/12": "#4670be",
  "Body/Medium": "Font(family: \"Inter\", style: Regular, size: 14, weight: 400, lineHeight: 20)",
  "hE/Dataviz/sequential/magma/01": "#fcfdbf",
  "hE/Dataviz/sequential/magma/02": "#fddea0",
  "hE/Dataviz/sequential/magma/03": "#febf84",
  "hE/Dataviz/sequential/magma/04": "#fe9f6d",
  "hE/Dataviz/sequential/magma/05": "#fa7f5e",
  "hE/Dataviz/sequential/magma/06": "#ef5350",
  "hE/Dataviz/sequential/magma/07": "#de4968",
  "hE/Dataviz/sequential/magma/08": "#c51162",
  "hE/Dataviz/sequential/magma/09": "#a8327d",
  "hE/Dataviz/sequential/magma/10": "#8c2981",
  "hE/Dataviz/sequential/magma/11": "#721f81",
  "hE/Dataviz/sequential/magma/12": "#57157e",
  "hE/Dataviz/diverging/ryb/01": "#751232",
  "hE/Dataviz/diverging/ryb/02": "#a52747",
  "hE/Dataviz/diverging/ryb/03": "#c65154",
  "hE/Dataviz/diverging/ryb/04": "#e47961",
  "hE/Dataviz/diverging/ryb/05": "#f0a882",
  "hE/Dataviz/diverging/ryb/06": "#fad4ac",
  "hE/Dataviz/diverging/ryb/07": "#fef0db",
  "hE/Dataviz/diverging/ryb/08": "#bce2cf",
  "hE/Dataviz/diverging/ryb/09": "#89c0c4",
  "hE/Dataviz/diverging/ryb/10": "#579eb9",
  "hE/Dataviz/diverging/ryb/11": "#397aa8",
  "hE/Dataviz/diverging/ryb/12": "#1c5796",
  "hE/Dataviz/diverging/ryb/13": "#163771",
  "hE/Sys/on-surface/secondary": "#e3e3e3",
  "hE/Sys/surface-container/secondary": "#2e2e2e",
  "hE/Core/grey/0%": "#1f1f1f00",
  "hE/Core/grey/0": "#1f1f1f",
  "hE/Core/grey/05": "#2e2e2e",
  "hE/Core/grey/10": "#484848",
  "hE/Core/grey/15": "#616161",
  "hE/Core/grey/20": "#707070",
  "hE/Core/grey/30": "#9e9e9e",
  "hE/Core/grey/40": "#bdbdbd",
  "hE/Core/grey/50": "#cccccc",
  "hE/Core/grey/60": "#d9d9d9",
  "hE/Core/grey/70": "#e3e3e3",
  "hE/Core/grey/90": "#f9f9f9",
  "hE/Core/grey/100": "#ffffff",
  "hE/Core/brand/05": "#010b40",
  "hE/Core/brand/10": "#00105e",
  "hE/Core/brand/15": "#152887",
  "hE/Core/brand/20": "#2b43bc",
  "hE/Core/brand/30": "#2e59df",
  "hE/Core/brand/40": "#2962ff",
  "hE/Core/brand/50": "#4592ff",
  "hE/Core/brand/60": "#7db6ff",
  "hE/Core/brand/70": "#a9cffd",
  "hE/Core/brand/80": "#cfe2fd",
  "hE/Core/brand/90": "#e6edfd",
  "hE/Core/brand/100": "#f5f7fd",
  "hE/Core/red/10": "#6d0004",
  "hE/Core/red/20": "#8d0005",
  "hE/Core/red/30": "#b00006",
  "hE/Core/red/40": "#d4262c",
  "hE/Core/red/50": "#e85f4e",
  "hE/Core/red/60": "#ed7d70",
  "hE/Core/red/70": "#ffb4ab",
  "hE/Core/red/80": "#ffdad6",
  "hE/Core/red/90": "#ffe4e1",
  "hE/Core/red/100": "#ffefed",
  "hE/Core/health/success-50": "#2e7d37",
  "hE/Core/health/success-100": "#abddad",
  "hE/Core/health/warning-50": "#ee811c",
  "hE/Core/health/warning-100": "#f2a055",
  "hE/Core/health/alert-50": "#ffd600",
  "hE/Core/health/alert-100": "#ffe767",
  "hE/Sys/primary/default": "#a9cffd",
  "hE/Sys/primary/hover": "#cfe2fd",
  "hE/Sys/primary/press": "#e6edfd",
  "hE/Sys/primary/disabled": "#707070",
  "hE/Sys/on-primary/default": "#1f1f1f",
  "hE/Sys/on-primary/disabled": "#2e2e2e",
  "hE/Sys/secondary/default": "#efefef",
  "hE/Sys/secondary/hover": "#f9f9f9",
  "hE/Sys/secondary/press": "#ffffff",
  "hE/Sys/secondary/disabled": "#707070",
  "hE/Sys/tertiary/error-default": "#ed7d70",
  "hE/Sys/tertiary/error-hover": "#ffb4ab",
  "hE/Sys/tertiary/error-press": "#ffdad6",
  "hE/Sys/surface/default": "#1f1f1f",
  "hE/Sys/surface/hover": "#2e2e2e",
  "hE/Sys/surface/press": "#616161",
  "hE/Sys/surface/selected": "#484848",
  "hE/Sys/surface/nav-hover": "#616161",
  "hE/Sys/surface/nav-press": "#707070",
  "hE/Sys/surface/tint-hover": "#484848",
  "hE/Sys/surface/tint-press": "#707070",
  "hE/Sys/surface/tint-selected": "#616161",
  "hE/Sys/surface/variant-hover": "#2e2e2e",
  "hE/Sys/surface/variant-press": "#484848",
  "hE/Sys/surface/error-hover": "#6d0004",
  "hE/Sys/surface/error-pressed": "#8d0005",
  "hE/Sys/opacity/primary-8%": "#f5f7fd14",
  "hE/Sys/opacity/primary-12%": "#f5f7fd1f",
  "hE/Sys/opacity/primary-16%": "#f5f7fd29",
  "hE/Sys/opacity/secondary-8%": "#e3e3e314",
  "hE/Sys/opacity/secondary-12%": "#e3e3e31f",
  "hE/Sys/opacity/secondary-16%": "#e3e3e329",
  "hE/Sys/on-surface/tertiary": "#cccccc",
  "hE/Sys/on-surface/disabled": "#707070",
  "hE/Sys/on-surface/tint-primary": "#a9cffd",
  "hE/Sys/on-surface/tint-secondary": "#7db6ff",
  "hE/Sys/surface-container/tertiary": "#484848",
  "hE/Sys/outline/secondary": "#616161",
  "hE/Sys/outline/tertiary": "#484848",
  "hE/Sys/outline/disabled": "#484848",
  "hE/Sys/outline/tint": "#a9cffd",
  "hE/Sys/outline/tint-secondary": "#4592ff",
  "hE/Sys/outline/tint-selected": "#a9cffd",
  "hE/Sys/outline/error": "#ed7d70"
};

console.log(`✅ Found ${Object.keys(mcpVariableDefs).length} variables from node 3049:19912\n`);

async function main() {
  const notionToken = process.env.NOTION_TOKEN;
  const notionDbId = process.env.NOTION_DB_ID;
  
  // Get node ID from: 1) command line arg, 2) env var, or 3) default
  const nodeIdArg = process.argv[2];
  let nodeId = nodeIdArg 
    ? nodeIdArg.replace(/-/g, ':') // Convert 119-1410 to 119:1410
    : (process.env.FIGMA_NODE_ID || "3049:19912");

  if (!notionToken || !notionDbId) {
    console.error('ERROR: NOTION_TOKEN and NOTION_DB_ID must be set in .env file');
    process.exit(1);
  }

  console.log('Starting MCP-based sync from Figma to Notion...');
  console.log(`Figma Node ID: ${nodeId}`);
  console.log(`Notion Database ID: ${notionDbId}`);
  console.log(`Found ${Object.keys(mcpVariableDefs).length} variable definitions\n`);

  try {
    const result = await syncFigmaToNotionMCP(
      notionToken,
      notionDbId,
      nodeId,
      mcpVariableDefs,
      undefined // No metadata needed for now
    );

    console.log('\n=== Sync Summary ===');
    console.log(`Total tokens processed: ${result.total}`);
    console.log(`Created: ${result.created}`);
    console.log(`Updated: ${result.updated}`);
    console.log('===================\n');
  } catch (error) {
    console.error('Error during sync:', error);
    process.exit(1);
  }
}

main();

