import { FigmaToken } from '../models';

/**
 * Valid category values for design tokens
 */
export type Category =
  | 'Color'
  | 'Typography'
  | 'Spacing'
  | 'Sizing'
  | 'Radius'
  | 'Shadow'
  | 'Opacity'
  | 'Elevation';

/**
 * Infers the category of a design token based on its properties and name patterns
 */
export function inferCategory(token: FigmaToken): Category {
  const nameLower = token.name.toLowerCase();
  // Also check the full path (collection/name) for patterns
  const fullPathLower = `${token.collection}/${token.name}`.toLowerCase();
  
  // Check value patterns FIRST (most reliable indicator)
  if (token.value) {
    const valueLower = token.value.toLowerCase();
    
    // Check for Font(...) pattern - this is Typography
    if (valueLower.startsWith('font(') || valueLower.includes('font(family')) {
      return 'Typography';
    }
    
    // Check for color values
    if (valueLower.startsWith('#') || valueLower.startsWith('rgb') || valueLower.startsWith('rgba')) {
      // But check if it's actually a spacing/sizing variable with color-like name
      if (fullPathLower.includes('space') || fullPathLower.includes('spacing') || 
          fullPathLower.includes('gap') || fullPathLower.includes('padding') || 
          fullPathLower.includes('margin')) {
        return 'Spacing';
      }
      return 'Color';
    }
    
    // Check for numeric values (spacing, sizing, etc.)
    const numericValue = parseFloat(valueLower);
    if (!isNaN(numericValue)) {
      // First check if it's typography-related (letter spacing, etc.)
      if (fullPathLower.includes('letter spacing') || fullPathLower.includes('letterspacing') ||
          fullPathLower.includes('letter-spacing')) {
        return 'Typography';
      }
      // Check name patterns to distinguish spacing vs sizing
      if (fullPathLower.includes('space') || fullPathLower.includes('spacing') || 
          fullPathLower.includes('gap') || fullPathLower.includes('padding') || 
          fullPathLower.includes('margin') || fullPathLower.includes('/ce/space')) {
        return 'Spacing';
      }
      if (fullPathLower.includes('size') || fullPathLower.includes('width') || 
          fullPathLower.includes('height') || fullPathLower.includes('line height') ||
          fullPathLower.includes('lineheight')) {
        return 'Sizing';
      }
      // Default numeric to Spacing if unclear
      return 'Spacing';
    }
  }
  
  // Check name patterns (check both name and full path)
  const searchText = `${fullPathLower} ${nameLower}`;
  
  if (searchText.includes('radius') || searchText.includes('border-radius')) {
    return 'Radius';
  }
  
  if (searchText.includes('shadow') || searchText.includes('elevation')) {
    return 'Shadow';
  }
  
  if (searchText.includes('opacity') || searchText.includes('alpha')) {
    return 'Opacity';
  }
  
  if (searchText.includes('z-index')) {
    return 'Elevation';
  }
  
  // Typography patterns - check for font-related terms (check BEFORE spacing)
  if (searchText.includes('font') || searchText.includes('typography') || 
      searchText.includes('text') || searchText.includes('body') ||
      searchText.includes('header') || searchText.includes('display') ||
      searchText.includes('label') || searchText.includes('title') ||
      searchText.includes('link') || searchText.includes('weight') ||
      searchText.includes('family') || searchText.includes('letter spacing') ||
      searchText.includes('letterspacing') || searchText.includes('letter-spacing')) {
    return 'Typography';
  }
  
  // Spacing patterns (but exclude letter spacing which is typography)
  if ((searchText.includes('space') || searchText.includes('spacing') || 
       searchText.includes('gap') || searchText.includes('padding') || 
       searchText.includes('margin')) && 
      !searchText.includes('letter spacing') && !searchText.includes('letterspacing')) {
    return 'Spacing';
  }
  
  // Sizing patterns
  if (searchText.includes('size') || searchText.includes('width') || 
      searchText.includes('height') || searchText.includes('line height') ||
      searchText.includes('lineheight')) {
    return 'Sizing';
  }
  
  // Check type-specific patterns for styles
  if (token.type === 'Style') {
    if (searchText.includes('color') || searchText.includes('fill') || searchText.includes('bg')) {
      return 'Color';
    }
    if (searchText.includes('text') || searchText.includes('font')) {
      return 'Typography';
    }
  }
  
  // Default to Color if no pattern matches
  return 'Color';
}

