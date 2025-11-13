# Using MCP Mode for Figma to Notion Sync

## Overview

MCP (Model Context Protocol) mode allows you to sync Figma design tokens to Notion without needing a Figma API token. This is especially useful since the REST API requires `file_variables:read` scope which may not be available in all token types.

## How MCP Mode Works

MCP tools are available in Cursor's AI context when you have a Figma file open. The sync process works as follows:

1. **You have a Figma file open** in the Figma desktop app
2. **You ask the AI assistant** (in Cursor) to sync Figma tokens to Notion
3. **The AI calls MCP tools** to get variable definitions and metadata from Figma
4. **The AI processes the data** and syncs it to your Notion database

## Setup

1. **Ensure Figma Desktop App is Running**
   - Open your Figma design file in the desktop app
   - Make sure MCP is enabled in Cursor (should be automatic if Figma MCP server is configured)

2. **Configure Your `.env` File**

   Create a `.env` file in the project root with the following variables:

   ```bash
   # ============================================
   # MCP Mode Configuration
   # ============================================
   # Set to 'true' to use MCP mode (recommended - no Figma token needed)
   # Set to 'false' or omit to use REST API mode (requires Figma token)
   USE_MCP=true

   # ============================================
   # Figma Configuration
   # ============================================
   # Optional: Figma Node ID (e.g., "3049:19912" or "0:1" for page root)
   # If not provided, will use currently selected node in Figma desktop app
   # Format: "node-id" or "node-id:node-id" (use colon, not dash)
   FIGMA_NODE_ID=3049:19912

   # Required ONLY if USE_MCP=false (REST API mode)
   # Your Figma API token (requires file_variables:read scope)
   # Get it from: https://www.figma.com/developers/api#access-tokens
   FIGMA_TOKEN=your_figma_api_token_here

   # Required ONLY if USE_MCP=false (REST API mode)
   # Your Figma file key (found in the Figma file URL)
   # Example: If URL is https://www.figma.com/file/ABC123/MyFile, then ABC123 is the file key
   FIGMA_FILE_KEY=your_figma_file_key_here

   # ============================================
   # Notion Configuration (Required)
   # ============================================
   # Your Notion integration token
   # Get it from: https://www.notion.so/my-integrations
   NOTION_TOKEN=secret_your_notion_integration_token_here

   # Your Notion database ID
   # Found in the database URL: https://www.notion.so/workspace/DATABASE_ID?v=...
   # Can be with or without dashes - the code will format it automatically
   NOTION_DB_ID=2a945752e68d8061a7adf16b6079bc64

   # ============================================
   # Image Hosting Configuration (Optional but Recommended)
   # ============================================
   # ImgBB API key for hosting color swatch images
   # Required for color tokens to display images in Notion
   # Get a free API key at: https://api.imgbb.com/
   # Without this, color swatch images won't be uploaded (but sync will still work)
   IMGBB_API_KEY=your_imgbb_api_key_here
   ```

   **Complete Example `.env` File:**

   ```bash
   # MCP Mode (Recommended)
   USE_MCP=true
   FIGMA_NODE_ID=3049:19912

   # Notion (Required)
   NOTION_TOKEN=secret_abc123xyz...
   NOTION_DB_ID=2a945752e68d8061a7adf16b6079bc64

   # Image Hosting (Recommended for color swatches)
   IMGBB_API_KEY=abc123def456...
   ```

   **Note:** When using MCP mode (`USE_MCP=true`), you do NOT need `FIGMA_TOKEN` or `FIGMA_FILE_KEY`. These are only required for REST API mode.

3. **Ask the AI to Sync**
   - In Cursor chat, simply ask: "Sync Figma design tokens to Notion"
   - Or: "Use MCP to get Figma variables and sync them to Notion"
   - The AI will:
     - Call `mcp_Figma_Desktop_get_variable_defs` to get variables
     - Call `mcp_Figma_Desktop_get_metadata` to get styles (if needed)
     - Process the data and sync to Notion

## Example Usage

### Basic Sync (Using Selected Node)
1. Open your Figma file
2. Select the root page or a specific node
3. In Cursor chat: "Sync Figma tokens to Notion using MCP"

### Sync with Specific Node ID
1. Set `FIGMA_NODE_ID=0:1` in your `.env` (for page root)
2. In Cursor chat: "Sync Figma tokens to Notion"

## Environment Variables Reference

### Required Variables

| Variable | Required When | Description |
|----------|--------------|-------------|
| `NOTION_TOKEN` | Always | Your Notion integration token. Get from [Notion Integrations](https://www.notion.so/my-integrations) |
| `NOTION_DB_ID` | Always | Your Notion database ID. Found in the database URL |

### MCP Mode Variables (`USE_MCP=true`)

| Variable | Required | Description |
|----------|----------|-------------|
| `USE_MCP` | Yes | Set to `true` to enable MCP mode |
| `FIGMA_NODE_ID` | No | Figma node ID (e.g., `3049:19912`). If omitted, uses currently selected node |
| `IMGBB_API_KEY` | Recommended | API key for hosting color swatch images. Get from [ImgBB](https://api.imgbb.com/) |

**Note:** When `USE_MCP=true`, you do NOT need `FIGMA_TOKEN` or `FIGMA_FILE_KEY`.

### REST API Mode Variables (`USE_MCP=false`)

| Variable | Required | Description |
|----------|----------|-------------|
| `USE_MCP` | Yes | Set to `false` or omit to use REST API mode |
| `FIGMA_TOKEN` | Yes | Your Figma API token (requires `file_variables:read` scope) |
| `FIGMA_FILE_KEY` | Yes | Your Figma file key (found in the file URL) |
| `IMGBB_API_KEY` | Recommended | API key for hosting color swatch images |

## Advantages of MCP Mode

- ✅ No Figma API token needed
- ✅ No scope/permission issues
- ✅ Works with any Figma file you have open
- ✅ Can use currently selected node automatically
- ✅ Direct access to Figma's variable system
- ✅ Automatically generates and uploads color swatch images (with `IMGBB_API_KEY`)

## Limitations

- ⚠️ Requires Figma desktop app to be running
- ⚠️ Requires running from Cursor's AI context (not pure CLI)
- ⚠️ MCP tools must be available in your Cursor setup

## Alternative: Standalone CLI with MCP Client

If you want to use MCP mode from a pure CLI (without AI assistance), you would need to:

1. Set up an MCP client library to connect to the Figma MCP server
2. Call MCP tools programmatically
3. Process the results and sync to Notion

This is more complex but possible. The current implementation provides the structure for this, but requires an MCP client library to be integrated.

## Troubleshooting

**"MCP server is only available if your active tab is a design or FigJam file"**
- Make sure you have a Figma design file open (not just the Figma app)
- Ensure the file is a design file, not a FigJam file (unless using FigJam-specific tools)

**"MCP variable definitions not provided"**
- The sync function expects MCP tool results to be passed in
- When using from Cursor's AI context, the AI should call MCP tools first
- Check that MCP tools are available in your Cursor setup

**No tokens found**
- Verify your Figma file has variables/styles defined
- Check that you're selecting the right node (try root page node ID: "0:1")
- Ensure MCP tools are returning data

**Color swatch images not displaying**
- Verify `IMGBB_API_KEY` is set in your `.env` file
- Check that the API key is valid (get a free one from https://api.imgbb.com/)
- Ensure your Notion database has an "Image" column of type "Files & media"
- Color images are only generated for tokens categorized as "Color"

**Invalid hex color errors**
- The tool automatically handles RGBA hex colors (e.g., `#1f1f1f00` → `#1f1f1f`)
- If you see errors, check that color values are in valid hex format (`#RRGGBB` or `#RRGGBBAA`)

## Getting Your API Keys

### Notion Integration Token
1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name (e.g., "Figma Token Sync")
4. Copy the "Internal Integration Token"
5. Share your Notion database with this integration (click "..." → "Add connections")

### ImgBB API Key (for Color Swatches)
1. Go to https://api.imgbb.com/
2. Sign up for a free account
3. Copy your API key from the dashboard
4. Add it to your `.env` file as `IMGBB_API_KEY`

### Figma API Token (REST API Mode Only)
1. Go to https://www.figma.com/developers/api#access-tokens
2. Generate a new personal access token
3. **Note:** Requires `file_variables:read` scope, which may not be available in all token types
4. If this scope is unavailable, use MCP mode instead (`USE_MCP=true`)

