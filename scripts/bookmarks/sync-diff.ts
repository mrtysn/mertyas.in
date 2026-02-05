import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFirefoxJson } from './parse-firefox-json.js';
import { generateBookmarksData } from './generate-bookmarks-data.js';
import type { BookmarksData } from '../../src/utils/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../../src/bookmarks/data/bookmarks.json');

export interface DiffResult {
  onlyLocal: Array<{ title: string; url: string }>;
  onlyFirefox: Array<{ title: string; url: string }>;
  titleChanged: Array<{ url: string; localTitle: string; firefoxTitle: string }>;
  folderChanged: Array<{ title: string; url: string; localFolder: string; firefoxFolder: string }>;
}

/**
 * Compare two BookmarksData objects and return the differences.
 */
export function computeDiff(local: BookmarksData, firefox: BookmarksData): DiffResult {
  const localByUrl = new Map(local.flatBookmarks.map(b => [b.url, b]));
  const firefoxByUrl = new Map(firefox.flatBookmarks.map(b => [b.url, b]));

  const result: DiffResult = {
    onlyLocal: [],
    onlyFirefox: [],
    titleChanged: [],
    folderChanged: [],
  };

  // Find bookmarks only in local
  for (const [url, bm] of localByUrl) {
    if (!firefoxByUrl.has(url)) {
      result.onlyLocal.push({ title: bm.title, url });
    }
  }

  // Find bookmarks only in Firefox, and diffs
  for (const [url, ffBm] of firefoxByUrl) {
    const localBm = localByUrl.get(url);
    if (!localBm) {
      result.onlyFirefox.push({ title: ffBm.title, url });
      continue;
    }

    if (localBm.title !== ffBm.title) {
      result.titleChanged.push({
        url,
        localTitle: localBm.title,
        firefoxTitle: ffBm.title,
      });
    }

    const localFolder = localBm.folderPath.join('/');
    const ffFolder = ffBm.folderPath.join('/');
    if (localFolder !== ffFolder) {
      result.folderChanged.push({
        title: localBm.title,
        url,
        localFolder,
        firefoxFolder: ffFolder,
      });
    }
  }

  return result;
}

function printDiff(result: DiffResult): void {
  console.log('Bookmark Diff Report\n');

  if (result.onlyLocal.length > 0) {
    console.log(`Only in local (${result.onlyLocal.length}):`);
    for (const b of result.onlyLocal.slice(0, 20)) {
      console.log(`  + ${b.title} — ${b.url}`);
    }
    if (result.onlyLocal.length > 20) console.log(`  ... and ${result.onlyLocal.length - 20} more`);
    console.log('');
  }

  if (result.onlyFirefox.length > 0) {
    console.log(`Only in Firefox (${result.onlyFirefox.length}):`);
    for (const b of result.onlyFirefox.slice(0, 20)) {
      console.log(`  + ${b.title} — ${b.url}`);
    }
    if (result.onlyFirefox.length > 20) console.log(`  ... and ${result.onlyFirefox.length - 20} more`);
    console.log('');
  }

  if (result.titleChanged.length > 0) {
    console.log(`Title changes (${result.titleChanged.length}):`);
    for (const c of result.titleChanged.slice(0, 20)) {
      console.log(`  ~ "${c.localTitle}" -> "${c.firefoxTitle}"`);
    }
    if (result.titleChanged.length > 20) console.log(`  ... and ${result.titleChanged.length - 20} more`);
    console.log('');
  }

  if (result.folderChanged.length > 0) {
    console.log(`Folder changes (${result.folderChanged.length}):`);
    for (const c of result.folderChanged.slice(0, 20)) {
      console.log(`  ~ ${c.title}: "${c.localFolder}" -> "${c.firefoxFolder}"`);
    }
    if (result.folderChanged.length > 20) console.log(`  ... and ${result.folderChanged.length - 20} more`);
    console.log('');
  }

  const total = result.onlyLocal.length + result.onlyFirefox.length + result.titleChanged.length + result.folderChanged.length;
  if (total === 0) {
    console.log('No differences found.');
  } else {
    console.log(`Total differences: ${total}`);
  }
}

// CLI entry point
if (process.argv[1] && process.argv[1].includes('sync-diff')) {
  const args = process.argv.slice(2);
  let firefoxPath = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--firefox' && args[i + 1]) {
      firefoxPath = args[i + 1];
      i++;
    } else if (!firefoxPath && !args[i].startsWith('--')) {
      firefoxPath = args[i];
    }
  }

  if (!firefoxPath) {
    console.error('Usage: pnpm bookmarks:diff --firefox <path-to-firefox-export.json>');
    process.exit(1);
  }

  if (!fs.existsSync(DATA_PATH)) {
    console.error('No local bookmarks.json found');
    process.exit(1);
  }

  if (!fs.existsSync(firefoxPath)) {
    console.error(`Firefox export not found: ${firefoxPath}`);
    process.exit(1);
  }

  const local: BookmarksData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const parsed = parseFirefoxJson(firefoxPath);
  const firefox = generateBookmarksData(parsed);
  const result = computeDiff(local, firefox);
  printDiff(result);
}
