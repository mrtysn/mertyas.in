import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFirefoxHtml } from './parse-firefox-html.js';
import { parseFirefoxJson } from './parse-firefox-json.js';
import { generateBookmarksData, writeBookmarksData } from './generate-bookmarks-data.js';
import { mergeBookmarks } from './merge-bookmarks.js';
import { migrateToV2 } from './migrate-v2.js';
import { loadCache } from './utils/cache-manager.js';
import type { BookmarksData } from '../../src/utils/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../../src/bookmarks/data/bookmarks.json');

/**
 * Whether a build may stamp `.cache/bookmarks-cache.json` link-check results
 * into bookmarks.json.
 *
 * Off, because the stamping has no freshness guard: every build applies
 * whatever the cache holds, however old. The cache currently holds a single
 * run from 2026-02-06 in which 2,022 of 2,551 requests failed — an offline or
 * rate-limited run — so each build was rewriting thousands of live links as
 * dead. Turning this back on needs an age check on `cached.checkedAt` first.
 *
 * The checker itself (`pnpm run bookmarks:check`) is unaffected; it writes the
 * cache, and only this stamping step reads it.
 */
const APPLY_LINK_CHECK_CACHE = false;

interface BuildOptions {
  input?: string;
  forceReplace?: boolean;
}


/**
 * Main orchestrator for building bookmarks
 */
async function buildBookmarks(options: BuildOptions = {}): Promise<void> {
  console.log('Building bookmarks...\n');

  try {
    // 1. If input provided, parse and generate/merge data
    if (options.input) {
      console.log(`Parsing Firefox bookmarks from: ${options.input}`);

      const ext = path.extname(options.input).toLowerCase();
      let parsed;

      if (ext === '.json') {
        console.log('Detected JSON format');
        parsed = parseFirefoxJson(options.input);
      } else if (ext === '.html' || ext === '.htm') {
        console.log('Detected HTML format');
        parsed = parseFirefoxHtml(options.input);
      } else {
        throw new Error(`Unsupported file format: ${ext}. Expected .json or .html`);
      }

      const incoming = generateBookmarksData(parsed);
      const existingPath = DATA_PATH;

      if (!options.forceReplace && fs.existsSync(existingPath)) {
        // Merge with existing data
        console.log('Existing bookmarks found — merging...');
        let existing: BookmarksData = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
        existing = migrateToV2(existing);

        const result = mergeBookmarks(existing, incoming, options.input);
        console.log(`  Merge result: +${result.added} added, ~${result.updated} updated, =${result.unchanged} unchanged, !${result.conflicts} conflicts`);

        writeBookmarksData(result.data);
      } else {
        // Fresh import (no existing data or --force-replace)
        if (options.forceReplace) {
          console.log('Force replace mode — overwriting existing data');
        }
        writeBookmarksData(incoming);
      }

      console.log('');
    }

    // 2. Load existing bookmarks data
    if (!fs.existsSync(DATA_PATH)) {
      console.log('No bookmarks data found. Please import bookmarks first:');
      console.log('  pnpm run import:bookmarks <path-to-bookmarks.json|html>');
      process.exit(1);
    }

    let bookmarksData: BookmarksData = JSON.parse(
      fs.readFileSync(DATA_PATH, 'utf-8')
    );

    // 2.5. Migrate if needed
    bookmarksData = migrateToV2(bookmarksData);

    // 3. Load cache
    const cache = loadCache();

    // 4. Persist link check results from cache into bookmarks
    if (APPLY_LINK_CHECK_CACHE) {
      for (const bookmark of bookmarksData.flatBookmarks) {
        const cached = cache.bookmarks[bookmark.id]?.linkCheck;
        if (cached) {
          bookmark.statusCode = cached.statusCode;
          bookmark.lastChecked = cached.checkedAt;
          bookmark.checkError = cached.error;
        }
      }
    }

    // 5. Sync folder tree with updated flat bookmarks
    const byId = new Map(bookmarksData.flatBookmarks.map(b => [b.id, b]));
    function syncFolderBookmarks(folder: typeof bookmarksData.root): void {
      folder.bookmarks = folder.bookmarks.map(b => byId.get(b.id) || b);
      for (const sub of folder.subfolders) {
        syncFolderBookmarks(sub);
      }
    }
    syncFolderBookmarks(bookmarksData.root);

    // 6. Update build metadata
    bookmarksData.buildInfo.lastBuild = Date.now();
    // Counts what actually reached bookmarks.json, not what sits in the cache —
    // with APPLY_LINK_CHECK_CACHE off those are different numbers.
    bookmarksData.buildInfo.checkedCount = APPLY_LINK_CHECK_CACHE
      ? Object.keys(cache.bookmarks).filter(id => cache.bookmarks[id].linkCheck)
          .length
      : bookmarksData.flatBookmarks.filter(b => b.lastChecked !== undefined)
          .length;

    const wrote = writeBookmarksData(bookmarksData);

    console.log(
      wrote
        ? '\nBookmarks build complete!'
        : '\nNo changes — bookmarks.json left untouched.'
    );
    console.log(`  Total bookmarks: ${bookmarksData.flatBookmarks.length}`);
    console.log(`  Links checked: ${bookmarksData.buildInfo.checkedCount}`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('\nBuild failed:', msg);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: BuildOptions = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--input' && args[i + 1]) {
    options.input = args[i + 1];
    i++;
  } else if (arg === '--force-replace') {
    options.forceReplace = true;
  } else if (arg.startsWith('--')) {
    console.error(`Unknown option: ${arg}`);
    process.exit(1);
  } else if (!options.input) {
    // Assume first non-flag argument is the input file
    options.input = arg;
  }
}

// Run the build
buildBookmarks(options);
