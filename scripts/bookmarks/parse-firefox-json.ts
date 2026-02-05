import fs from 'fs';

export interface ParsedNode {
  type: 'folder' | 'bookmark';
  title: string;
  url?: string;
  addDate?: number;
  lastModified?: number;
  icon?: string;
  children?: ParsedNode[];
  firefoxGuid?: string;
}

interface FirefoxNode {
  guid: string;
  title: string;
  typeCode: number;
  uri?: string;
  dateAdded?: number;
  lastModified?: number;
  icon?: string;
  iconUri?: string;
  children?: FirefoxNode[];
}

/**
 * Parse Firefox bookmarks JSON file
 * typeCode: 1 = bookmark, 2 = folder
 */
export function parseFirefoxJson(jsonPath: string): ParsedNode {
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`File not found: ${jsonPath}`);
  }

  const json = fs.readFileSync(jsonPath, 'utf-8');
  const root: FirefoxNode = JSON.parse(json);

  return {
    type: 'folder',
    title: 'Root',
    children: parseChildren(root.children || []),
  };
}

function parseChildren(nodes: FirefoxNode[]): ParsedNode[] {
  return nodes.map(node => parseNode(node)).filter(Boolean) as ParsedNode[];
}

function parseNode(node: FirefoxNode): ParsedNode | null {
  // Skip special Firefox folders (menu, toolbar, unfiled, etc.)
  // We'll include them but could filter if needed

  if (node.typeCode === 2) {
    // Folder
    return {
      type: 'folder',
      title: node.title || 'Unnamed Folder',
      addDate: node.dateAdded ? Math.floor(node.dateAdded / 1000000) : undefined, // Convert microseconds to seconds
      lastModified: node.lastModified ? Math.floor(node.lastModified / 1000000) : undefined,
      children: parseChildren(node.children || []),
      firefoxGuid: node.guid || undefined,
    };
  } else if (node.typeCode === 1 && node.uri) {
    // Bookmark
    return {
      type: 'bookmark',
      title: node.title || 'Unnamed Bookmark',
      url: node.uri,
      addDate: node.dateAdded ? Math.floor(node.dateAdded / 1000000) : undefined,
      lastModified: node.lastModified ? Math.floor(node.lastModified / 1000000) : undefined,
      icon: node.icon || undefined, // Base64 data URI
      firefoxGuid: node.guid || undefined,
    };
  }

  // Skip unknown types
  return null;
}
