import { Client } from '@notionhq/client';
import { FigmaToken, NotionPageMap, SyncResult } from './models';
import { uploadColorSwatchPng, extractHexColor } from './utils/colorSwatch';

/**
 * Notion API property types - using any to match Notion SDK's flexible property types
 */
type NotionProperties = Record<string, any>;

/**
 * Gets all existing tokens from Notion database, indexed by Figma ID
 * Handles pagination automatically
 */
export async function getExistingNotionTokens(
  dbId: string,
  token: string
): Promise<NotionPageMap> {
  const notion = new Client({ auth: token });
  const pageMap = new Map<string, string>();

  try {
    let cursor: string | undefined = undefined;
    let hasMore = true;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: dbId,
        start_cursor: cursor,
        page_size: 100,
      });

      // Process each page
      for (const page of response.results) {
        if ('properties' in page) {
          const figmaIdProperty = page.properties['Figma ID'];
          
          if (figmaIdProperty && 'rich_text' in figmaIdProperty) {
            const richText = figmaIdProperty.rich_text;
            if (Array.isArray(richText) && richText.length > 0) {
              const firstItem = richText[0];
              if (firstItem && 'text' in firstItem && firstItem.text) {
                const figmaId = firstItem.text.content;
                if (figmaId) {
                  pageMap.set(figmaId, page.id);
                }
              }
            }
          } else if (figmaIdProperty && 'title' in figmaIdProperty) {
            // Fallback: check if Figma ID is stored as title
            const title = figmaIdProperty.title;
            if (Array.isArray(title) && title.length > 0) {
              const firstItem = title[0];
              if (firstItem && 'text' in firstItem && firstItem.text) {
                const figmaId = firstItem.text.content;
                if (figmaId) {
                  pageMap.set(figmaId, page.id);
                }
              }
            }
          }
        }
      }

      hasMore = response.has_more;
      cursor = response.next_cursor || undefined;
    }

    return pageMap;
  } catch (error) {
    console.error('Error fetching existing Notion tokens:', error);
    throw error;
  }
}

/**
 * Converts a FigmaToken to Notion API property format
 */
export async function toNotionProperties(
  token: FigmaToken,
  notionToken?: string
): Promise<NotionProperties> {
  const properties: NotionProperties = {
    Name: {
      title: [{ text: { content: token.name } }],
    },
    Category: {
      select: { name: token.category },
    },
    Collection: {
      select: { name: token.collection },
    },
    Mode: {
      select: { name: token.mode },
    },
    Type: {
      select: { name: token.type },
    },
    Value: {
      rich_text: [{ text: { content: token.value || '' } }],
    },
    'Resolved Value': {
      rich_text: [{ text: { content: token.resolvedValue || token.value || '' } }],
    },
    'Figma ID': {
      rich_text: [{ text: { content: token.id } }],
    },
    'Figma Collection': {
      rich_text: [{ text: { content: token.collection } }],
    },
    Status: {
      select: { name: 'In Sync' },
    },
    'Last Synced': {
      date: { start: new Date().toISOString() },
    },
  };

  // Add description if present
  if (token.description) {
    properties.Description = {
      rich_text: [{ text: { content: token.description } }],
    };
  }

  // Add empty optional fields
  properties['CSS Variable'] = {
    rich_text: [{ text: { content: '' } }],
  };
  properties['Code Path'] = {
    rich_text: [{ text: { content: '' } }],
  };
  properties['Component Usage'] = {
    multi_select: [],
  };

  // Generate and add color swatch image for Color category tokens
  if (token.category === 'Color') {
    const hexColor = extractHexColor(token.value);
    if (hexColor) {
      // Generate PNG and upload to external hosting (ImgBB or freeimage.host)
      const fileName = `${token.name.replace(/[^a-zA-Z0-9]/g, '_')}-swatch.png`;
      const imageUrl = await uploadColorSwatchPng(hexColor, fileName);
      
      if (imageUrl) {
        properties['Image'] = {
          files: [
            {
              name: fileName,
              type: 'external',
              external: {
                url: imageUrl
              }
            }
          ]
        };
      }
    }
  }

  return properties;
}

/**
 * Creates a new Notion page for a token
 */
async function createNotionPage(
  dbId: string,
  token: FigmaToken,
  notionToken: string
): Promise<void> {
  const notion = new Client({ auth: notionToken });
  const properties = await toNotionProperties(token, notionToken);

  try {
    await notion.pages.create({
      parent: { database_id: dbId },
      properties,
    });
  } catch (error) {
    console.error(`Error creating Notion page for token ${token.id}:`, error);
    throw error;
  }
}

/**
 * Updates an existing Notion page for a token
 */
async function updateNotionPage(
  pageId: string,
  token: FigmaToken,
  notionToken: string
): Promise<void> {
  const notion = new Client({ auth: notionToken });
  const properties = await toNotionProperties(token, notionToken);

  try {
    await notion.pages.update({
      page_id: pageId,
      properties,
    });
  } catch (error) {
    console.error(`Error updating Notion page ${pageId} for token ${token.id}:`, error);
    throw error;
  }
}

/**
 * Upserts tokens into Notion database
 * Creates new pages for tokens that don't exist, updates existing ones
 */
export async function upsertNotionTokens(
  tokens: FigmaToken[],
  dbId: string,
  notionToken: string
): Promise<SyncResult> {
  const existingTokens = await getExistingNotionTokens(dbId, notionToken);
  let created = 0;
  let updated = 0;

  for (const token of tokens) {
    try {
      const existingPageId = existingTokens.get(token.id);
      
      if (existingPageId) {
        await updateNotionPage(existingPageId, token, notionToken);
        updated++;
      } else {
        await createNotionPage(dbId, token, notionToken);
        created++;
      }
    } catch (error) {
      // Log error but continue processing other tokens
      console.error(`Failed to upsert token ${token.id} (${token.name}):`, error);
    }
  }

  return {
    created,
    updated,
    total: tokens.length,
  };
}

