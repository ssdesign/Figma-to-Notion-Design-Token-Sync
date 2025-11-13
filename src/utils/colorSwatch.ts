/**
 * Utility to generate color swatch images from HEX color values
 * Uses SVG format for simplicity and Notion compatibility
 */

/**
 * Converts HEX color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Handle 3-digit hex
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  
  // Handle 6-digit hex
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  
  return null;
}

/**
 * Generates a simple SVG color swatch (100x100px)
 * Returns the SVG as a string
 */
export function generateColorSwatchSVG(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  
  if (!rgb) {
    // Fallback to gray if hex is invalid
    return generateColorSwatchSVG('#CCCCCC');
  }
  
  // Create a simple SVG with the color
  const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="rgb(${rgb.r}, ${rgb.g}, ${rgb.b})"/>
</svg>`;
  
  return svg;
}

/**
 * Generates a PNG color swatch buffer using sharp
 * Returns a Buffer containing the PNG image data
 */
async function generateColorSwatchBuffer(hexColor: string): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const rgb = hexToRgb(hexColor);
  
  if (!rgb) {
    throw new Error(`Invalid hex color: ${hexColor}`);
  }
  
  // Create a 100x100px PNG with the specified color
  return await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: rgb
    }
  })
  .png()
  .toBuffer();
}

/**
 * Uploads PNG color swatch to ImgBB (external hosting)
 * Returns the publicly accessible URL
 */
async function uploadPngToImgBB(pngBuffer: Buffer, apiKey: string): Promise<string | null> {
  try {
    // Use URL-encoded form data (this is what works!)
    const base64Image = pngBuffer.toString('base64');
    const body = new URLSearchParams();
    body.append('image', base64Image);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as any;
    // Use display_url which is specifically for embedding/display
    return data.data?.display_url || data.data?.url || null;
  } catch (error: any) {
    return null;
  }
}

/**
 * Uploads PNG color swatch to Postimages.org (no API key needed)
 * Returns the publicly accessible URL
 */
async function uploadPngToPostimages(pngBuffer: Buffer): Promise<string | null> {
  try {
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('upload', pngBuffer, {
      filename: 'swatch.png',
      contentType: 'image/png',
    });
    formData.append('token', 'default');
    
    const response = await fetch('https://postimages.org/json/rr', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });
    
    if (!response.ok) {
      console.log(`Postimages upload failed: ${response.status}`);
      return null;
    }
    
    const data = await response.json() as any;
    console.log('Postimages response:', JSON.stringify(data).substring(0, 200));
    return data.url || null;
  } catch (error: any) {
    console.log(`Postimages error: ${error.message}`);
    return null;
  }
}

/**
 * Generates a PNG color swatch and uploads to external hosting
 * Returns the publicly accessible URL for use in Notion
 */
export async function uploadColorSwatchPng(
  hexColor: string,
  fileName: string
): Promise<string | null> {
  try {
    // Generate PNG buffer
    const pngBuffer = await generateColorSwatchBuffer(hexColor);
    
    // Try ImgBB if API key is available
    const imgbbKey = process.env.IMGBB_API_KEY;
    if (imgbbKey) {
      const url = await uploadPngToImgBB(pngBuffer, imgbbKey);
      if (url) {
        return url;
      }
    }
    
    // Fallback: Try Postimages (though it's less reliable)
    const url = await uploadPngToPostimages(pngBuffer);
    if (url) {
      return url;
    }
    
    return null;
  } catch (error: any) {
    console.warn(`Error uploading color swatch PNG: ${error.message}`);
    return null;
  }
}

/**
 * Generates a simple SVG color swatch
 * Returns the SVG string
 */
export function generateColorSwatchSVGString(hexColor: string): string {
  return generateColorSwatchSVG(hexColor);
}

/**
 * Extracts HEX color from various formats
 * Handles: #RRGGBB, #RRGGBBAA (with alpha), rgb(r,g,b), rgba(r,g,b,a), etc.
 */
export function extractHexColor(value: string): string | null {
  // Already a hex color
  if (value.startsWith('#')) {
    const hex = value.slice(1);
    // Handle RGBA hex (#RRGGBBAA) - strip alpha channel for display
    if (hex.length === 8) {
      // Return RGB only (first 6 chars)
      return `#${hex.slice(0, 6)}`;
    }
    // Handle RGB hex (#RRGGBB)
    if (hex.length === 6) {
      return value;
    }
    // Handle short hex (#RGB) - expand to full
    if (hex.length === 3) {
      return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
    }
    return null;
  }
  
  // RGB/RGBA format: rgb(46, 46, 46) or rgba(46, 46, 46, 1)
  const rgbMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  
  return null;
}

