import type { Bookmark, BookmarkCache } from '../../src/utils/types.js';

interface CheckLinksOptions {
  recheckAfterDays: number;
  maxConcurrent: number;
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

  if (toCheck.length === 0) {
    console.log('✓ All links are up to date');
    return;
  }

  console.log(`Checking ${toCheck.length} links...`);

  // Process in batches for concurrency control
  for (let i = 0; i < toCheck.length; i += maxConcurrent) {
    const batch = toCheck.slice(i, i + maxConcurrent);
    await Promise.all(batch.map(bookmark => checkLink(bookmark, cache)));

    const progress = Math.min(i + maxConcurrent, toCheck.length);
    process.stdout.write(`\r  ${progress}/${toCheck.length} checked`);
  }

  console.log('\n✓ Link checking complete');
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
  } catch (error: any) {
    cache.bookmarks[bookmark.id].linkCheck = {
      statusCode: 0,
      checkedAt: Date.now(),
      error: error.message || 'Unknown error',
    };
  }
}
