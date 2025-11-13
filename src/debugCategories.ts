/**
 * Debug script to show raw Figma variable output and category inference
 */
import dotenv from 'dotenv';
import { fetchAllFigmaTokensMCP } from './figmaClientMCP';

dotenv.config();

// Sample variable definitions from node 3049:19912
const mcpVariableDefs: Record<string, unknown> = {
  "hE/Sys/on-surface/primary": "#2e2e2e",
  "Font/Letter spacing/xs_boomi_only": "0",
  "Font/Size/5xl": "44",
  "Font/Weight/Regular": "Regular",
  "Font/Family/Display": "Inter",
  "Font/Line height/2xl": "48",
  "Display/Large": "Font(family: \"Inter\", style: Regular, size: 44, weight: 400, lineHeight: 48)",
  "semantic/state/ce/space04": "4",
  "semantic/state/ce/space08": "8",
  "semantic/state/ce/space12": "12",
  "hE/Dataviz/categorical/01": "#2998bd",
  "hE/Core/grey/80": "#4d4d4d",
  "Body/Tiny": "Font(family: \"Inter\", style: Regular, size: 10, weight: 400, lineHeight: 16)",
  "Label/Small": "Font(family: \"Inter\", style: Medium, size: 12, weight: 500, lineHeight: 16)",
};

async function main() {
  console.log('=== RAW FIGMA VARIABLE OUTPUT ===\n');
  
  console.log('Sample variables from MCP get_variable_defs:\n');
  Object.entries(mcpVariableDefs).forEach(([key, value]) => {
    console.log(`Key: "${key}"`);
    console.log(`Value: ${value}`);
    console.log(`Type: ${typeof value}`);
    console.log('');
  });

  console.log('\n=== PROCESSED TOKENS WITH CATEGORIES ===\n');
  
  const tokens = await fetchAllFigmaTokensMCP("3049:19912", mcpVariableDefs, undefined);
  
  console.log(`Total tokens processed: ${tokens.length}\n`);
  
  // Group by category to see the issue
  const byCategory = new Map<string, typeof tokens>();
  tokens.forEach(token => {
    if (!byCategory.has(token.category)) {
      byCategory.set(token.category, []);
    }
    byCategory.get(token.category)!.push(token);
  });

  console.log('Tokens grouped by inferred category:\n');
  byCategory.forEach((tokens, category) => {
    console.log(`\n${category} (${tokens.length} tokens):`);
    tokens.slice(0, 10).forEach(token => {
      console.log(`  - ${token.name} (${token.type}) | Value: ${token.value.substring(0, 50)}`);
    });
    if (tokens.length > 10) {
      console.log(`  ... and ${tokens.length - 10} more`);
    }
  });

  console.log('\n\n=== SAMPLE TOKENS WITH DETAILS ===\n');
  
  // Show first 20 tokens with full details
  tokens.slice(0, 20).forEach((token, idx) => {
    console.log(`${idx + 1}. ${token.name}`);
    console.log(`   Collection: ${token.collection}`);
    console.log(`   Type: ${token.type}`);
    console.log(`   Value: ${token.value}`);
    console.log(`   Category: ${token.category} ← INFERRED`);
    console.log(`   Figma ID: ${token.id}`);
    console.log('');
  });
}

main().catch(console.error);

