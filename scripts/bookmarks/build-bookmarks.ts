import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFirefoxHtml } from './parse-firefox-html.js';
import { parseFirefoxJson } from './parse-firefox-json.js';
import { generateBookmarksData } from './generate-bookmarks-data.js';
import { checkLinks } from './check-links.js';
import { loadCache, saveCache } from './utils/cache-manager.js';
import type { BookmarksData } from '../../src/utils/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../../src/bookmarks/data/bookmarks.json');

interface BuildOptions {
  input?: string;
  skipLinkCheck?: boolean;
}

/**
 * Main orchestrator for building bookmarks
 */
async function buildBookmarks(options: BuildOptions = {}): Promise<void> {
  console.log('Building bookmarks...\n');

  try {
    // 1. If input provided, parse and generate data
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

      generateBookmarksData(parsed);
      console.log('');
    }

    // 2. Load existing bookmarks data
    if (!fs.existsSync(DATA_PATH)) {
      console.log('No bookmarks data found. Please import bookmarks first:');
      console.log('  pnpm run import:bookmarks <path-to-bookmarks.json|html>');
      process.exit(1);
    }

    const bookmarksData: BookmarksData = JSON.parse(
      fs.readFileSync(DATA_PATH, 'utf-8')
    );

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

    // 5. Update build metadata
    bookmarksData.buildInfo.lastBuild = Date.now();
    bookmarksData.buildInfo.checkedCount = Object.keys(cache.bookmarks).filter(
      id => cache.bookmarks[id].linkCheck
    ).length;

    fs.writeFileSync(DATA_PATH, JSON.stringify(bookmarksData, null, 2), 'utf-8');

    console.log('\n✓ Bookmarks build complete!');
    console.log(`  Total bookmarks: ${bookmarksData.flatBookmarks.length}`);
    console.log(`  Links checked: ${bookmarksData.buildInfo.checkedCount}`);
  } catch (error: any) {
    console.error('\n✗ Build failed:', error.message);
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
