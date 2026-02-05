import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Bookmark, BookmarkFolder, BookmarksData } from '../../src/utils/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../../src/bookmarks/data/bookmarks.json');

interface FirefoxNode {
  guid: string;
  title: string;
  index: number;
  dateAdded: number;
  lastModified: number;
  id: number;
  typeCode: number;
  type?: string;
  root?: string;
  children?: FirefoxNode[];
  uri?: string;
  iconUri?: string;
}

let nextId = 1;

function folderToFirefox(folder: BookmarkFolder, index: number): FirefoxNode {
  const node: FirefoxNode = {
    guid: folder.firefoxGuid || generateGuid(),
    title: folder.name,
    index,
    dateAdded: Date.now() * 1000,
    lastModified: Date.now() * 1000,
    id: nextId++,
    typeCode: 2,
    type: 'text/x-moz-place-container',
    children: [],
  };

  let childIndex = 0;

  for (const sub of folder.subfolders) {
    node.children!.push(folderToFirefox(sub, childIndex++));
  }

  for (const bm of folder.bookmarks) {
    node.children!.push(bookmarkToFirefox(bm, childIndex++));
  }

  return node;
}

function bookmarkToFirefox(bookmark: Bookmark, index: number): FirefoxNode {
  return {
    guid: bookmark.firefoxGuid || generateGuid(),
    title: bookmark.title,
    index,
    dateAdded: bookmark.addDate * 1000000,
    lastModified: (bookmark.lastModified || bookmark.addDate) * 1000000,
    id: nextId++,
    typeCode: 1,
    type: 'text/x-moz-place',
    uri: bookmark.url,
  };
}

function generateGuid(): string {
  // Firefox uses 12-character base64-like GUIDs
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function exportFirefoxJson(outputPath: string): void {
  if (!fs.existsSync(DATA_PATH)) {
    console.error('No bookmarks.json found');
    process.exit(1);
  }

  const data: BookmarksData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

  // Build Firefox root structure
  const root: FirefoxNode = {
    guid: 'root________',
    title: '',
    index: 0,
    dateAdded: Date.now() * 1000,
    lastModified: Date.now() * 1000,
    id: nextId++,
    typeCode: 2,
    type: 'text/x-moz-place-container',
    root: 'placesRoot',
    children: [],
  };

  // Map subfolders to Firefox's known roots where possible
  for (let i = 0; i < data.root.subfolders.length; i++) {
    const sub = data.root.subfolders[i];
    const ffNode = folderToFirefox(sub, i);

    // Map common folder names to Firefox root GUIDs
    if (sub.name.toLowerCase() === 'menu' || sub.name.toLowerCase() === 'bookmarks menu') {
      ffNode.guid = 'menu________';
      ffNode.root = 'bookmarksMenuFolder';
    } else if (sub.name.toLowerCase() === 'toolbar' || sub.name.toLowerCase() === 'bookmarks toolbar') {
      ffNode.guid = 'toolbar_____';
      ffNode.root = 'toolbarFolder';
    } else if (sub.name.toLowerCase() === 'unfiled' || sub.name.toLowerCase() === 'other bookmarks') {
      ffNode.guid = 'unfiled_____';
      ffNode.root = 'unfiledBookmarksFolder';
    }

    root.children!.push(ffNode);
  }

  // Also export root-level bookmarks into "unfiled"
  if (data.root.bookmarks.length > 0) {
    let unfiled = root.children!.find(c => c.root === 'unfiledBookmarksFolder');
    if (!unfiled) {
      unfiled = {
        guid: 'unfiled_____',
        title: 'Other Bookmarks',
        index: root.children!.length,
        dateAdded: Date.now() * 1000,
        lastModified: Date.now() * 1000,
        id: nextId++,
        typeCode: 2,
        type: 'text/x-moz-place-container',
        root: 'unfiledBookmarksFolder',
        children: [],
      };
      root.children!.push(unfiled);
    }
    for (const bm of data.root.bookmarks) {
      unfiled.children!.push(bookmarkToFirefox(bm, unfiled.children!.length));
    }
  }

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(root, null, 2), 'utf-8');
  console.log(`Exported ${data.flatBookmarks.length} bookmarks to ${outputPath}`);
}

// CLI
const args = process.argv.slice(2);
let outputPath = './bookmarks-firefox-export.json';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output' && args[i + 1]) {
    outputPath = args[i + 1];
    i++;
  }
}

exportFirefoxJson(outputPath);
