import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFirefoxHtml } from './parse-firefox-html.js';
import { parseFirefoxJson } from './parse-firefox-json.js';
import { generateBookmarksData, writeBookmarksData } from './generate-bookmarks-data.js';
import { mergeBookmarks } from './merge-bookmarks.js';
import { migrateToV2 } from './migrate-v2.js';
import { checkLinks } from './check-links.js';
import { loadCache, saveCache } from './utils/cache-manager.js';
import type { BookmarksData } from '../../src/utils/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../../src/bookmarks/data/bookmarks.json');

interface BuildOptions {
  input?: string;
  skipLinkCheck?: boolean;
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

    // 4. Check links
    if (!options.skipLinkCheck) {
      await checkLinks(bookmarksData.flatBookmarks, cache, {
        recheckAfterDays: 7,
        maxConcurrent: 10,
      });
      saveCache(cache);
    } else {
      console.log('Skipping link checking');
    }

    // 5. Persist link check results from cache into bookmarks
    for (const bookmark of bookmarksData.flatBookmarks) {
      const cached = cache.bookmarks[bookmark.id]?.linkCheck;
      if (cached) {
        bookmark.statusCode = cached.statusCode;
        bookmark.lastChecked = cached.checkedAt;
        bookmark.checkError = cached.error;
      }
    }

    // Also update bookmarks within the folder tree
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
    bookmarksData.buildInfo.checkedCount = Object.keys(cache.bookmarks).filter(
      id => cache.bookmarks[id].linkCheck
    ).length;

    fs.writeFileSync(DATA_PATH, JSON.stringify(bookmarksData, null, 2), 'utf-8');

    console.log('\nBookmarks build complete!');
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
  } else if (arg === '--skip-link-check') {
    options.skipLinkCheck = true;
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
