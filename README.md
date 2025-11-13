# Figma to Notion Design Token Sync

A TypeScript CLI tool that synchronizes Figma design tokens (Variables and Styles) into a Notion database. Uses Figma ID as the primary key to determine whether to create new pages or update existing ones.

## Features

- Fetches design tokens from Figma using the Variables API and Styles API
- Normalizes tokens to a shared representation
- Upserts tokens to Notion database (creates new pages or updates existing ones)
- Automatically categorizes tokens based on type and naming patterns
- Sets status to "In Sync" and updates "Last Synced" timestamp on every sync
- Handles pagination for large Notion databases

## Prerequisites

- Node.js 18+ (for native fetch support) or Node.js 16+ with node-fetch
- npm or yarn
- A Figma API token
- A Notion integration token and database ID

## Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

## Configuration

### Option 1: Using MCP (Recommended - No Figma Token Needed)

If you have Figma MCP set up in Cursor, you can use MCP mode which doesn't require a Figma API token:

1. Create a `.env` file in the project root:

```bash
# ============================================
# MCP Mode Configuration
# ============================================
# Set to 'true' to use MCP mode (recommended - no Figma token needed)
USE_MCP=true

# ============================================
# Figma Configuration
# ============================================
# Optional: Figma Node ID (e.g., "1234:56789" or "0:1" for page root)
# If not provided, will use currently selected node in Figma desktop app
# Format: "node-id" or "node-id:node-id" (use colon, not dash)
FIGMA_NODE_ID=1234:56789

# ============================================
# Notion Configuration (Required)
# ============================================
# Your Notion integration token
# Get it from: https://www.notion.so/my-integrations
NOTION_TOKEN=secret_your_notion_integration_token_here

# Your Notion database ID
# Found in the database URL: https://www.notion.so/workspace/DATABASE_ID?v=...
# Can be with or without dashes - the code will format it automatically
NOTION_DB_ID=aksj84yhsjki8mjah739rehj876wyj8u

# ============================================
# Image Hosting Configuration (Optional but Recommended)
# ============================================
# ImgBB API key for hosting color swatch images
# Required for color tokens to display images in Notion
# Get a free API key at: https://api.imgbb.com/
# Without this, color swatch images won't be uploaded (but sync will still work)
IMGBB_API_KEY=your_imgbb_api_key_here
```

**Complete Example `.env` File for MCP Mode:**

```bash
# MCP Mode (Recommended)
USE_MCP=true
FIGMA_NODE_ID=1234:56789

# Notion (Required)
NOTION_TOKEN=secret_abc123xyz...
NOTION_DB_ID=aksj84yhsjki8mjah739rehj876wyj8u

# Image Hosting (Recommended for color swatches)
IMGBB_API_KEY=abc123def456...
```

**Note:** MCP mode works best when:
- You have a Figma file open in the Figma desktop app
- You're running the sync from Cursor's context (where MCP tools are available)
- Or you've set up an MCP client to connect to the Figma MCP server

**When using MCP mode (`USE_MCP=true`), you do NOT need `FIGMA_TOKEN` or `FIGMA_FILE_KEY`.**

### Option 2: Using REST API (Requires Figma Token with file_variables:read scope)

**⚠️ Note:** The REST API requires a Figma token with `file_variables:read` scope, which may not be available in all token types.

1. Create a `.env` file in the project root:

```bash
# ============================================
# REST API Mode Configuration
# ============================================
# Set to 'false' or omit to use REST API mode
USE_MCP=false

# ============================================
# Figma Configuration (Required for REST API Mode)
# ============================================
# Your Figma API token (requires file_variables:read scope)
# Get it from: https://www.figma.com/developers/api#access-tokens
FIGMA_TOKEN=your_figma_api_token_here

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
NOTION_DB_ID=aksj84yhsjki8mjah739rehj876wyj8u

# ============================================
# Image Hosting Configuration (Optional but Recommended)
# ============================================
# ImgBB API key for hosting color swatch images
# Get a free API key at: https://api.imgbb.com/
IMGBB_API_KEY=your_imgbb_api_key_here
```

## Environment Variables Reference

### Required Variables (All Modes)

| Variable | Description | How to Get |
|----------|-------------|------------|
| `NOTION_TOKEN` | Your Notion integration token | [Notion Integrations](https://www.notion.so/my-integrations) |
| `NOTION_DB_ID` | Your Notion database ID | Found in database URL: `https://www.notion.so/workspace/DATABASE_ID?v=...` |

### MCP Mode Variables (`USE_MCP=true`)

| Variable | Required | Description |
|----------|----------|-------------|
| `USE_MCP` | Yes | Set to `true` to enable MCP mode |
| `FIGMA_NODE_ID` | No | Figma node ID (e.g., `1234:56789`). If omitted, uses currently selected node |
| `IMGBB_API_KEY` | Recommended | API key for hosting color swatch images. Get from [ImgBB](https://api.imgbb.com/) |

**Note:** When `USE_MCP=true`, you do NOT need `FIGMA_TOKEN` or `FIGMA_FILE_KEY`.

### REST API Mode Variables (`USE_MCP=false`)

| Variable | Required | Description |
|----------|----------|-------------|
| `USE_MCP` | Yes | Set to `false` or omit to use REST API mode |
| `FIGMA_TOKEN` | Yes | Your Figma API token (requires `file_variables:read` scope) |
| `FIGMA_FILE_KEY` | Yes | Your Figma file key (found in the file URL) |
| `IMGBB_API_KEY` | Recommended | API key for hosting color swatch images |

## Getting Your API Keys

### Getting Your Notion Integration Token

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name (e.g., "Figma Token Sync")
4. Copy the "Internal Integration Token"
5. **Important:** Share your Notion database with this integration:
   - Open your Notion database
   - Click "..." (three dots) in the top right
   - Select "Add connections"
   - Find and select your integration

### Getting Your ImgBB API Key (for Color Swatches)

1. Go to https://api.imgbb.com/
2. Sign up for a free account
3. Copy your API key from the dashboard
4. Add it to your `.env` file as `IMGBB_API_KEY`

**Note:** This is optional but highly recommended. Without it, color swatch images won't be uploaded to Notion (but the sync will still work for other token properties).

### Getting Your Figma API Token (REST API Mode Only)

**Note:** REST API mode requires `file_variables:read` scope, which may not be available in all token types. Consider using MCP mode instead.

1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll to "Personal access tokens"
3. Click "Create new token"
4. **Important:** Ensure `file_variables:read` scope is selected (if available)
5. Copy the token and add it to your `.env` file as `FIGMA_TOKEN`

### Getting Your Figma File Key (REST API Mode Only)

1. Open your Figma file
2. Look at the URL: `https://www.figma.com/file/{FILE_KEY}/...`
3. Copy the `FILE_KEY` and add it to your `.env` file as `FIGMA_FILE_KEY`

### Using MCP Mode

MCP mode doesn't require a Figma token or file key. Instead:

1. **Have Figma Desktop App Open**: Make sure the Figma desktop app is running with your design file open
2. **Select a Node** (optional): You can select a specific node/page in Figma, or use the root page
3. **Run from Cursor**: The sync can be initiated from Cursor's chat interface where MCP tools are available
4. **Or Use Node ID**: Provide `FIGMA_NODE_ID` in your `.env` (e.g., `"1234:56789"` or `"0:1"` for page root)

**MCP Tools Used:**
- `mcp_Figma_Desktop_get_variable_defs` - Gets variable definitions
- `mcp_Figma_Desktop_get_metadata` - Gets file metadata (for styles)

### Getting Your Notion Database ID

1. Open your Notion database in a browser
2. Look at the URL: `https://www.notion.so/{WORKSPACE}/{DATABASE_ID}?v=...`
3. The database ID is the long string of characters (32 characters, can be with or without hyphens)
4. Copy it and add it to your `.env` file as `NOTION_DB_ID` (the code will format it automatically)

## Notion Database Schema

Your Notion database should have the following properties (exact names required):

**📋 Sample Database:** You can copy a pre-configured Notion database template: [Copy Sample Database](https://heather-polyanthus-048.notion.site/2aa45752e68d81a4afd7dcad5be5fa66?v=2aa45752e68d815c9377000c6856c809&source=copy_link)

This template includes all required properties and is ready to use. Simply duplicate it to your workspace and share it with your Notion integration.

- **Name** (Title) - Token name
- **Category** (Select) - Color, Typography, Spacing, Sizing, Radius, Shadow, Opacity, Elevation
- **Collection** (Select) - Collection name from Figma
- **Mode** (Select) - Light, Dark, Default, etc.
- **Type** (Select) - Variable or Style
- **Value** (Rich text) - Raw token value
- **Resolved Value** (Rich text) - Resolved token value
- **CSS Variable** (Text) - Optional, can be empty
- **Alias Of** (Relation → Design Tokens) - Optional, ignored for now
- **Figma ID** (Rich text or Text) - The Figma variable/style ID (used as primary key)
- **Figma Collection** (Rich text) - Name of Figma variable collection
- **Code Path** (Text) - Optional, can be empty
- **Component Usage** (Multi-select) - Optional, can be empty
- **Status** (Select) - In Sync, Drift, Proposed, Deprecated, Error
- **Description** (Rich text) - Token description from Figma
- **Last Synced** (Date) - Automatically set on sync
- **Image** (Files) - Color swatch images (PNG) for Color category tokens - automatically generated
- **Created At** (Created time) - Automatic
- **Created By** (Created by) - Automatic
- **Updated At** (Last edited time) - Automatic

### Color Swatch Images

For Color category tokens, the tool automatically generates PNG color swatch images (100x100px) and uploads them to the Image property. This requires:

1. **ImgBB API Key (Recommended)**: Get a free API key at https://api.imgbb.com/ and add it to your `.env` file as `IMGBB_API_KEY`
2. **Alternative**: The tool will try fallback hosting services, but they may have rate limits

Without an API key, color tokens will sync but won't have images in the Image property.

## Usage

Run the sync command:

```bash
npm run sync-figma-to-notion
```

The tool will:
1. Fetch all variables and styles from the specified Figma file
2. Normalize them to a shared token representation
3. Query existing tokens in Notion (indexed by Figma ID)
4. Create new pages for tokens that don't exist
5. Update existing pages for tokens that already exist
6. Set status to "In Sync" and update "Last Synced" timestamp

### Output Example

```
Starting sync from Figma to Notion...
Figma File Key: abc123xyz
Notion Database ID: def456uvw
Fetching tokens from Figma...
Found 45 tokens in Figma (30 variables, 15 styles)
Syncing tokens to Notion...
Sync complete!

=== Sync Summary ===
Total tokens processed: 45
Created: 12
Updated: 33
===================
```

## How It Works

1. **Figma Variables**: Fetched from `/v1/files/{file_key}/variables/local` endpoint
   - Extracts variable collections, variables, and mode values
   - Formats color values as RGB/RGBA
   - Uses the first available mode for each variable

2. **Figma Styles**: Extracted from `/v1/files/{file_key}` endpoint
   - Processes FILL, TEXT, EFFECT, and GRID style types
   - Maps style types to categories (FILL → Color, TEXT → Typography, etc.)

3. **Category Inference**: Uses heuristics based on:
   - Variable type (COLOR → Color, FLOAT → Spacing/Sizing)
   - Style type (FILL → Color, TEXT → Typography)
   - Name patterns (e.g., `/radius/` → Radius, `/shadow/` → Shadow)

4. **Notion Upsert**: Uses Figma ID as the primary key
   - Queries all existing pages (handles pagination)
   - Creates new pages for tokens not found in Notion
   - Updates existing pages for tokens that already exist

## Error Handling

- Individual token failures are logged but don't stop the sync process
- API errors are logged with details
- Missing environment variables cause the tool to exit with an error message

## Troubleshooting

### MCP Mode Issues

**"MCP server is only available if your active tab is a design or FigJam file"**
- Make sure you have a Figma design file open (not just the Figma app)
- Ensure the file is a design file, not a FigJam file (unless using FigJam-specific tools)

**"MCP variable definitions not provided"**
- The sync function expects MCP tool results to be passed in
- When using from Cursor's AI context, the AI should call MCP tools first
- Check that MCP tools are available in your Cursor setup

**No tokens found**
- Verify your Figma file has variables/styles defined
- Check that you're selecting the right node (try root page node ID: `"0:1"`)
- Ensure MCP tools are returning data

**Color swatch images not displaying**
- Verify `IMGBB_API_KEY` is set in your `.env` file
- Check that the API key is valid (get a free one from https://api.imgbb.com/)
- Ensure your Notion database has an "Image" column of type "Files & media"
- Color images are only generated for tokens categorized as "Color"

**Invalid hex color errors**
- The tool automatically handles RGBA hex colors (e.g., `#1f1f1f00` → `#1f1f1f`)
- If you see errors, check that color values are in valid hex format (`#RRGGBB` or `#RRGGBBAA`)

### REST API Mode Issues

**"file_variables:read scope not available"**
- Some Figma token types don't support this scope
- Consider using MCP mode instead (`USE_MCP=true`)

**"Object not found" errors**
- Verify your `FIGMA_FILE_KEY` is correct (found in the Figma file URL)
- Ensure your Figma token has access to the file

### Notion Integration Issues

**"Object not found" or "Unauthorized" errors**
- Verify your `NOTION_TOKEN` is correct
- Ensure your Notion database is shared with the integration:
  1. Open your Notion database
  2. Click "..." (three dots) in the top right
  3. Select "Add connections"
  4. Find and select your integration

**Database schema errors**
- Ensure your Notion database has all required properties (see "Notion Database Schema" section above)
- Property names must match exactly (case-sensitive)

## MCP Mode Advantages & Limitations

### Advantages

- ✅ No Figma API token needed
- ✅ No scope/permission issues
- ✅ Works with any Figma file you have open
- ✅ Can use currently selected node automatically
- ✅ Direct access to Figma's variable system
- ✅ Automatically generates and uploads color swatch images (with `IMGBB_API_KEY`)

### Limitations

- ⚠️ Requires Figma desktop app to be running
- ⚠️ Requires running from Cursor's AI context (not pure CLI)
- ⚠️ MCP tools must be available in your Cursor setup

**Note:** If you want to use MCP mode from a pure CLI (without AI assistance), you would need to set up an MCP client library to connect to the Figma MCP server and call MCP tools programmatically. The current implementation provides the structure for this, but requires an MCP client library to be integrated.

## Future Enhancements

- Support for multiple Figma files
- Notion → Figma sync (bidirectional)
- Mark tokens as "Deprecated" when they disappear from Figma
- Resolve actual color values for styles
- Handle mode-resolved values for variables
- Support for alias relationships

## License

ISC

