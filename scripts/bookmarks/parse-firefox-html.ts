import fs from 'fs';

export interface ParsedNode {
  type: 'folder' | 'bookmark';
  title: string;
  url?: string;
  addDate?: number;
  lastModified?: number;
  icon?: string;
  children?: ParsedNode[];
}

/**
 * Parse Firefox bookmarks HTML file using simple string parsing
 */
export function parseFirefoxHtml(htmlPath: string): ParsedNode {
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`File not found: ${htmlPath}`);
  }

  const html = fs.readFileSync(htmlPath, 'utf-8');

  return {
    type: 'folder',
    title: 'Root',
    children: parseLevel(html, 0).nodes,
  };
}

/**
 * Parse a level of nesting in the HTML
 */
function parseLevel(html: string, startPos: number): { nodes: ParsedNode[]; endPos: number } {
  const nodes: ParsedNode[] = [];
  let pos = startPos;

  while (pos < html.length) {
    // Look for <DT> tags
    const dtMatch = html.indexOf('<DT>', pos);
    if (dtMatch === -1) break;

    pos = dtMatch + 4;

    // Check if this is a folder (H3) or bookmark (A)
    const h3Match = html.indexOf('<H3', pos);
    const aMatch = html.indexOf('<A ', pos);
    const nextDT = html.indexOf('<DT>', pos);
    const dlClose = html.indexOf('</DL>', pos);

    // If we hit </DL>, we're done with this level
    if (dlClose !== -1 && (h3Match === -1 || dlClose < h3Match) && (aMatch === -1 || dlClose < aMatch)) {
      return { nodes, endPos: dlClose + 5 };
    }

    // Determine if this is a folder or bookmark
    const isFolder = h3Match !== -1 && (aMatch === -1 || h3Match < aMatch) && (nextDT === -1 || h3Match < nextDT);

    if (isFolder) {
      // Parse folder
      const h3End = html.indexOf('>', h3Match);
      const h3Attrs = html.substring(h3Match, h3End);
      const h3Close = html.indexOf('</H3>', h3End);
      const title = html.substring(h3End + 1, h3Close).trim();

      const folder: ParsedNode = {
        type: 'folder',
        title: title || 'Unnamed Folder',
        addDate: extractNumber(h3Attrs, 'ADD_DATE'),
        lastModified: extractNumber(h3Attrs, 'LAST_MODIFIED'),
        children: [],
      };

      // Look for nested <DL> after this folder
      const dlStart = html.indexOf('<DL>', h3Close);
      if (dlStart !== -1 && (nextDT === -1 || dlStart < nextDT)) {
        const result = parseLevel(html, dlStart + 4);
        folder.children = result.nodes;
        pos = result.endPos;
      } else {
        pos = h3Close + 5;
      }

      nodes.push(folder);
    } else if (aMatch !== -1) {
      // Parse bookmark
      const aEnd = html.indexOf('>', aMatch);
      const aAttrs = html.substring(aMatch, aEnd);
      const aClose = html.indexOf('</A>', aEnd);
      const title = html.substring(aEnd + 1, aClose).trim();

      const bookmark: ParsedNode = {
        type: 'bookmark',
        title: title || 'Unnamed Bookmark',
        url: extractAttribute(aAttrs, 'HREF'),
        addDate: extractNumber(aAttrs, 'ADD_DATE'),
        lastModified: extractNumber(aAttrs, 'LAST_MODIFIED'),
        icon: extractAttribute(aAttrs, 'ICON'),
      };

      nodes.push(bookmark);
      pos = aClose + 4;
    } else {
      break;
    }
  }

  return { nodes, endPos: pos };
}

/**
 * Extract an attribute value from HTML attributes string
 */
function extractAttribute(attrs: string, name: string): string | undefined {
  const regex = new RegExp(`${name}="([^"]*)"`, 'i');
  const match = attrs.match(regex);
  return match ? match[1] : undefined;
}

/**
 * Extract a numeric attribute value
 */
function extractNumber(attrs: string, name: string): number | undefined {
  const value = extractAttribute(attrs, name);
  return value ? parseInt(value, 10) : undefined;
}
