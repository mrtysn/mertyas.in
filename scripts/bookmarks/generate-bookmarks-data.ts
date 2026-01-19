import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Bookmark, BookmarkFolder, BookmarksData } from '../../src/utils/types.js';
import type { ParsedNode } from './parse-firefox-html.js';
import { generateBookmarkId, generateFolderId } from './utils/hash-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../../src/bookmarks/data/bookmarks.json');

/**
 * Generate bookmarks.json from parsed Firefox HTML tree
 */
export function generateBookmarksData(parsedTree: ParsedNode): void {
  const flatBookmarks: Bookmark[] = [];
  const root: BookmarkFolder = convertToFolder(parsedTree, [], flatBookmarks);

  const data: BookmarksData = {
    version: '1.0.0',
    importDate: Date.now(),
    root,
    flatBookmarks,
    buildInfo: {
      totalBookmarks: flatBookmarks.length,
      checkedCount: 0,
      previewsGenerated: 0,
      lastBuild: Date.now(),
    },
  };

  // Ensure directory exists
  const dataDir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write to file
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✓ Generated bookmarks data: ${flatBookmarks.length} bookmarks`);
}

/**
 * Convert a parsed node to a BookmarkFolder
 */
function convertToFolder(
  node: ParsedNode,
  parentPath: string[],
  flatBookmarks: Bookmark[]
): BookmarkFolder {
  const currentPath = node.title === 'Root' ? [] : [...parentPath, node.title];
  const folder: BookmarkFolder = {
    id: generateFolderId(currentPath),
    name: node.title,
    path: currentPath,
    bookmarks: [],
    subfolders: [],
  };

  if (!node.children) {
    return folder;
  }

  for (const child of node.children) {
    if (child.type === 'folder') {
      folder.subfolders.push(convertToFolder(child, currentPath, flatBookmarks));
    } else if (child.type === 'bookmark' && child.url) {
      const bookmark = convertToBookmark(child, currentPath);
      folder.bookmarks.push(bookmark);
      flatBookmarks.push(bookmark);
    }
  }

  return folder;
}

/**
 * Convert a parsed node to a Bookmark
 */
function convertToBookmark(node: ParsedNode, folderPath: string[]): Bookmark {
  if (!node.url) {
    throw new Error('Bookmark node must have a URL');
  }

  return {
    id: generateBookmarkId(node.url, node.title),
    title: node.title,
    url: node.url,
    addDate: node.addDate || Date.now(),
    lastModified: node.lastModified,
    icon: node.icon,
    tags: generateTags(folderPath),
    folderPath,
  };
}

/**
 * Generate tags from folder path (lowercase folder names)
 */
function generateTags(folderPath: string[]): string[] {
  return folderPath.map(name => name.toLowerCase().replace(/\s+/g, '-'));
}
