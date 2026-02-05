import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Bookmark, BookmarksData } from '../../src/utils/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../../src/bookmarks/data/bookmarks.json');

interface WaybackResponse {
  archived_snapshots?: {
    closest?: {
      available: boolean;
      url: string;
      timestamp: string;
      status: string;
    };
  };
}

/**
 * Check the Wayback Machine for archived versions of dead bookmarks.
 * Rate limited to 1 request per second per API guidelines.
 */
export async function checkWayback(bookmarks: Bookmark[]): Promise<number> {
  const dead = bookmarks.filter(
    b => !b.archiveUrl && (b.statusCode === 0 || (b.statusCode && b.statusCode >= 400))
  );

  if (dead.length === 0) {
    console.log('  No dead bookmarks to check against Wayback Machine');
    return 0;
  }

  console.log(`Checking ${dead.length} dead bookmarks against Wayback Machine...`);
  let found = 0;

  for (let i = 0; i < dead.length; i++) {
    const bookmark = dead[i];
    try {
      const apiUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(bookmark.url)}`;
      const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data: WaybackResponse = await response.json();
        const snapshot = data.archived_snapshots?.closest;
        if (snapshot?.available && snapshot.url) {
          bookmark.archiveUrl = snapshot.url;
          found++;
        }
      }
    } catch {
      // Silently skip — network errors are expected for rate limiting
    }

    process.stdout.write(`\r  ${i + 1}/${dead.length} checked, ${found} archived`);

    // Rate limit: 1 request per second
    if (i < dead.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('');
  return found;
}

// Allow running standalone
if (process.argv[1] && process.argv[1].includes('check-wayback')) {
  if (!fs.existsSync(DATA_PATH)) {
    console.error('No bookmarks.json found');
    process.exit(1);
  }

  const data: BookmarksData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  checkWayback(data.flatBookmarks).then(found => {
    console.log(`\nFound ${found} archived versions`);
    // Save back
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log('Saved updated bookmarks.');
  });
}
