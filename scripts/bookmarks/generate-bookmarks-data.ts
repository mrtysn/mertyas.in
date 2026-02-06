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
 * Generate BookmarksData from parsed Firefox tree.
 * Returns the data object — caller decides whether to write or merge.
 */
export function generateBookmarksData(parsedTree: ParsedNode): BookmarksData {
  const flatBookmarks: Bookmark[] = [];
  const root: BookmarkFolder = convertToFolder(parsedTree, [], flatBookmarks);

  const data: BookmarksData = {
    version: '1.1.0',
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

  return data;
}

/**
 * Write BookmarksData to disk.
 */
export function writeBookmarksData(data: BookmarksData): void {
  const dataDir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  Generated bookmarks data: ${data.flatBookmarks.length} bookmarks`);
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
    firefoxGuid: node.firefoxGuid,
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
    firefoxGuid: node.firefoxGuid,
    source: 'firefox',
  };
}

/**
 * Generate tags from folder path (lowercase folder names)
 */
function generateTags(folderPath: string[]): string[] {
  return folderPath.map(name => name.toLowerCase().replace(/\s+/g, '-'));
}
