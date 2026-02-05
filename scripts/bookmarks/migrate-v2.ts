import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { BookmarksData, BookmarkFolder } from '../../src/utils/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../../src/bookmarks/data/bookmarks.json');

/**
 * Migrate bookmarks.json from v1.0.0 to v2.0.0.
 * Adds `source: 'firefox'` to all bookmarks and bumps version.
 */
export function migrateToV2(data: BookmarksData): BookmarksData {
  if (data.version === '2.0.0') {
    return data;
  }

  console.log('  Migrating bookmarks data from v1 to v2...');

  // Add source to all flat bookmarks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const b of data.flatBookmarks as any[]) {
    if (!b.source) {
      b.source = 'firefox';
    }
  }

  // Also update bookmarks within the folder tree
  function migrateFolderBookmarks(folder: BookmarkFolder): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const b of folder.bookmarks as any[]) {
      if (!b.source) {
        b.source = 'firefox';
      }
    }
    for (const sub of folder.subfolders) {
      migrateFolderBookmarks(sub);
    }
  }
  migrateFolderBookmarks(data.root);

  data.version = '2.0.0';

  if (!data.syncInfo) {
    data.syncInfo = {
      importHistory: [],
    };
  }

  console.log(`  Migration complete. ${data.flatBookmarks.length} bookmarks updated to v2.`);
  return data;
}

// Allow running standalone
if (process.argv[1] && process.argv[1].includes('migrate-v2')) {
  if (!fs.existsSync(DATA_PATH)) {
    console.error('No bookmarks.json found at', DATA_PATH);
    process.exit(1);
  }

  const data: BookmarksData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const migrated = migrateToV2(data);
  fs.writeFileSync(DATA_PATH, JSON.stringify(migrated, null, 2), 'utf-8');
  console.log('Saved migrated data.');
}
