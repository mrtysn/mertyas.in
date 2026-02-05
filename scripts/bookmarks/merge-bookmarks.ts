import type { Bookmark, BookmarkFolder, BookmarksData, SyncHistoryEntry } from '../../src/utils/types.js';

export interface MergeResult {
  added: number;
  updated: number;
  unchanged: number;
  conflicts: number;
  data: BookmarksData;
}

/**
 * Merge incoming bookmarks data with existing data.
 *
 * Matching priority: firefoxGuid > id > url
 * Rules:
 *   - New bookmark (no match) → add
 *   - Match found, existing NOT locallyModified → update from incoming
 *   - Match found, existing IS locallyModified → keep existing (conflict counted)
 */
export function mergeBookmarks(
  existing: BookmarksData,
  incoming: BookmarksData,
  source: string
): MergeResult {
  // Build lookup indices from existing flat bookmarks
  const byGuid = new Map<string, Bookmark>();
  const byId = new Map<string, Bookmark>();
  const byUrl = new Map<string, Bookmark>();

  for (const b of existing.flatBookmarks) {
    if (b.firefoxGuid) byGuid.set(b.firefoxGuid, b);
    byId.set(b.id, b);
    byUrl.set(b.url, b);
  }

  let added = 0;
  let updated = 0;
  let unchanged = 0;
  let conflicts = 0;

  // Process each incoming bookmark
  for (const incoming_bm of incoming.flatBookmarks) {
    const match = findMatch(incoming_bm, byGuid, byId, byUrl);

    if (!match) {
      // New bookmark — add it
      added++;
      continue;
    }

    if (match.locallyModified) {
      // Locally modified — preserve existing, count as conflict
      conflicts++;
      // Copy local data onto the incoming bookmark so tree rebuild uses the local version
      Object.assign(incoming_bm, match);
    } else if (hasChanges(match, incoming_bm)) {
      // Existing not modified, incoming has changes — update
      updated++;
      // Preserve any local-only fields from existing
      incoming_bm.lastChecked = match.lastChecked;
      incoming_bm.statusCode = match.statusCode;
      incoming_bm.checkError = match.checkError;
      incoming_bm.archiveUrl = match.archiveUrl;
      incoming_bm.description = match.description || incoming_bm.description;
    } else {
      // No changes
      unchanged++;
      // Preserve cached fields
      incoming_bm.lastChecked = match.lastChecked;
      incoming_bm.statusCode = match.statusCode;
      incoming_bm.checkError = match.checkError;
      incoming_bm.archiveUrl = match.archiveUrl;
      incoming_bm.description = match.description || incoming_bm.description;
    }
  }

  // Rebuild folder tree with merged flat bookmarks
  rebuildFolderBookmarks(incoming.root, incoming.flatBookmarks);

  // Merge folder GUIDs from existing into incoming where missing
  mergeFolderGuids(existing.root, incoming.root);

  // Preserve sync history
  const historyEntry: SyncHistoryEntry = {
    date: Date.now(),
    source,
    added,
    updated,
    unchanged,
  };

  incoming.syncInfo = {
    lastImportSource: source,
    lastImportDate: Date.now(),
    importHistory: [
      ...(existing.syncInfo?.importHistory || []),
      historyEntry,
    ],
  };

  // Preserve build info from existing
  incoming.buildInfo = {
    ...existing.buildInfo,
    totalBookmarks: incoming.flatBookmarks.length,
    lastBuild: Date.now(),
  };

  return { added, updated, unchanged, conflicts, data: incoming };
}

function findMatch(
  bookmark: Bookmark,
  byGuid: Map<string, Bookmark>,
  byId: Map<string, Bookmark>,
  byUrl: Map<string, Bookmark>
): Bookmark | undefined {
  if (bookmark.firefoxGuid) {
    const m = byGuid.get(bookmark.firefoxGuid);
    if (m) return m;
  }
  const m = byId.get(bookmark.id);
  if (m) return m;
  return byUrl.get(bookmark.url);
}

function hasChanges(existing: Bookmark, incoming: Bookmark): boolean {
  return (
    existing.title !== incoming.title ||
    existing.url !== incoming.url ||
    existing.icon !== incoming.icon ||
    JSON.stringify(existing.folderPath) !== JSON.stringify(incoming.folderPath)
  );
}

/**
 * After merging flat bookmarks, rebuild the folder tree's bookmark references
 * to point to the merged versions.
 */
function rebuildFolderBookmarks(folder: BookmarkFolder, flatBookmarks: Bookmark[]): void {
  // Build a lookup by id for quick access
  const byId = new Map(flatBookmarks.map(b => [b.id, b]));

  function rebuild(f: BookmarkFolder): void {
    f.bookmarks = f.bookmarks.map(b => byId.get(b.id) || b);
    for (const sub of f.subfolders) {
      rebuild(sub);
    }
  }

  rebuild(folder);
}

/**
 * Propagate existing folder GUIDs to incoming folders (matched by path).
 */
function mergeFolderGuids(existing: BookmarkFolder, incoming: BookmarkFolder): void {
  if (existing.firefoxGuid && !incoming.firefoxGuid) {
    incoming.firefoxGuid = existing.firefoxGuid;
  }
  for (const inSub of incoming.subfolders) {
    const exSub = existing.subfolders.find(s => s.name === inSub.name);
    if (exSub) {
      mergeFolderGuids(exSub, inSub);
    }
  }
}
