import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadCache, saveCache } from './utils/cache-manager.js';
import type { Bookmark, BookmarkCache, BookmarksData } from '../../src/utils/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CheckLinksOptions {
  recheckAfterDays: number;
  maxConcurrent: number;
  onProgress?: (event: LinkCheckProgress) => void;
}

export interface LinkCheckProgress {
  type: 'progress' | 'complete';
  checked: number;
  total: number;
}

/**
 * Check bookmark links using HTTP HEAD requests
 */
export async function checkLinks(
  bookmarks: Bookmark[],
  cache: BookmarkCache,
  options: CheckLinksOptions
): Promise<void> {
  const { recheckAfterDays, maxConcurrent } = options;

  // Filter bookmarks that need checking
  const toCheck = bookmarks.filter(bookmark => {
    const cached = cache.bookmarks[bookmark.id]?.linkCheck;
    if (!cached) return true;

    const age = Date.now() - cached.checkedAt;
    const maxAge = recheckAfterDays * 24 * 60 * 60 * 1000;
    return age > maxAge;
  });

  const emit = options.onProgress || (() => {});

  if (toCheck.length === 0) {
    emit({ type: 'complete', checked: 0, total: 0 });
    return;
  }

  // Process in batches for concurrency control
  for (let i = 0; i < toCheck.length; i += maxConcurrent) {
    const batch = toCheck.slice(i, i + maxConcurrent);
    await Promise.all(batch.map(bookmark => checkLink(bookmark, cache)));

    const progress = Math.min(i + maxConcurrent, toCheck.length);
    emit({ type: 'progress', checked: progress, total: toCheck.length });
  }

  emit({ type: 'complete', checked: toCheck.length, total: toCheck.length });
}

/**
 * Check a single bookmark link
 */
async function checkLink(bookmark: Bookmark, cache: BookmarkCache): Promise<void> {
  // Initialize cache entry if it doesn't exist
  if (!cache.bookmarks[bookmark.id]) {
    cache.bookmarks[bookmark.id] = {
      url: bookmark.url,
      lastModified: bookmark.lastModified || bookmark.addDate,
    };
  }

  try {
    const response = await fetch(bookmark.url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    });

    cache.bookmarks[bookmark.id].linkCheck = {
      statusCode: response.status,
      checkedAt: Date.now(),
    };
  } catch (error: unknown) {
    cache.bookmarks[bookmark.id].linkCheck = {
      statusCode: 0,
      checkedAt: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Standalone CLI entry point
if (process.argv[1] && process.argv[1].includes('check-links')) {
  const DATA_PATH = path.join(__dirname, '../../src/bookmarks/data/bookmarks.json');

  if (!fs.existsSync(DATA_PATH)) {
    console.error('No bookmarks.json found at', DATA_PATH);
    process.exit(1);
  }

  const data: BookmarksData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const cache = loadCache();

  console.log(`Checking ${data.flatBookmarks.length} bookmarks...\n`);

  checkLinks(data.flatBookmarks, cache, {
    recheckAfterDays: 7,
    maxConcurrent: 10,
    onProgress: (event) => {
      if (event.type === 'progress') {
        process.stdout.write(`\r  Checked ${event.checked}/${event.total}`);
      } else {
        console.log(`\n  Done. Checked ${event.checked} links.`);
      }
    },
  }).then(() => {
    saveCache(cache);

    // Persist results into bookmarks.json
    for (const bookmark of data.flatBookmarks) {
      const cached = cache.bookmarks[bookmark.id]?.linkCheck;
      if (cached) {
        bookmark.statusCode = cached.statusCode;
        bookmark.lastChecked = cached.checkedAt;
        bookmark.checkError = cached.error;
      }
    }

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log('Results saved to bookmarks.json');
  });
}
