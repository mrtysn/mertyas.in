import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Bookmark, BookmarksData } from '../../src/utils/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../../src/bookmarks/data/bookmarks.json');
const MAX_CONCURRENT = 10;

/**
 * Extract og:image or twitter:image URL from HTML
 */
function extractPreviewUrl(html: string): string | null {
  // Match <meta property="og:image" content="..."> or <meta name="twitter:image" content="...">
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogMatch) return ogMatch[1];

  const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
  if (twMatch) return twMatch[1];

  return null;
}

/**
 * Fetch preview image URL for a single bookmark
 */
async function fetchPreview(bookmark: Bookmark): Promise<string | null> {
  try {
    const response = await fetch(bookmark.url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BookmarkPreviewBot/1.0)',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return null;

    const html = await response.text();
    return extractPreviewUrl(html);
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  if (!fs.existsSync(DATA_PATH)) {
    console.error('No bookmarks.json found at', DATA_PATH);
    process.exit(1);
  }

  const data: BookmarksData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

  // Only fetch for bookmarks without a preview that are live (2xx) or unchecked
  const candidates = data.flatBookmarks.filter(b => {
    if (b.previewImage) return false;
    if (b.statusCode !== undefined && (b.statusCode === 0 || b.statusCode >= 400)) return false;
    return true;
  });

  console.log(`Fetching OG previews for ${candidates.length} bookmarks (${data.flatBookmarks.length} total)...\n`);

  let fetched = 0;
  let found = 0;

  for (let i = 0; i < candidates.length; i += MAX_CONCURRENT) {
    const batch = candidates.slice(i, i + MAX_CONCURRENT);
    const results = await Promise.all(batch.map(async (bookmark) => {
      const url = await fetchPreview(bookmark);
      return { bookmark, url };
    }));

    for (const { bookmark, url } of results) {
      if (url) {
        bookmark.previewImage = url;
        found++;
      }
    }

    fetched += batch.length;
    process.stdout.write(`\r  Processed ${fetched}/${candidates.length} — found ${found} previews`);
  }

  console.log(`\n\nDone. Found ${found} preview images out of ${candidates.length} candidates.`);

  // Sync previews into folder tree
  const byId = new Map(data.flatBookmarks.map(b => [b.id, b]));
  function syncFolder(folder: typeof data.root): void {
    folder.bookmarks = folder.bookmarks.map(b => byId.get(b.id) || b);
    for (const sub of folder.subfolders) syncFolder(sub);
  }
  syncFolder(data.root);

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log('Saved to bookmarks.json');
}

main();
