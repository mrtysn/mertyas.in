import type { BookmarksData, Bookmark, BookmarkFolder } from './types';

const bookmarksFile = import.meta.glob<BookmarksData>(
  '../bookmarks/data/bookmarks.json',
  { eager: true, import: 'default' }
);

/**
 * Get all bookmarks data
 */
export function getAllBookmarks(): BookmarksData {
  const entries = Object.values(bookmarksFile);

  if (entries.length === 0) {
    return {
      version: '1.1.0',
      importDate: 0,
      root: {
        id: 'root',
        name: 'Root',
        path: [],
        bookmarks: [],
        subfolders: [],
      },
      flatBookmarks: [],
      buildInfo: {
        totalBookmarks: 0,
        checkedCount: 0,
        previewsGenerated: 0,
        lastBuild: 0,
      },
    };
  }

  return entries[0];
}

/**
 * Get bookmarks by folder path
 */
export function getBookmarksByFolder(
  data: BookmarksData,
  folderPath: string[]
): { bookmarks: Bookmark[]; subfolders: BookmarkFolder[] } {
  let current = data.root;

  for (const segment of folderPath) {
    const subfolder = current.subfolders.find((f) => f.name === segment);
    if (!subfolder) {
      return { bookmarks: [], subfolders: [] };
    }
    current = subfolder;
  }

  return {
    bookmarks: current.bookmarks,
    subfolders: current.subfolders,
  };
}

/**
 * Search bookmarks by query
 */
export function searchBookmarks(data: BookmarksData, query: string): Bookmark[] {
  const lowerQuery = query.toLowerCase();
  return data.flatBookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(lowerQuery) ||
      b.url.toLowerCase().includes(lowerQuery) ||
      b.tags.some((t) => t.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get bookmarks by tag
 */
export function getBookmarksByTag(data: BookmarksData, tag: string): Bookmark[] {
  return data.flatBookmarks.filter((b) => b.tags.includes(tag));
}

/**
 * URL of a folder page; the root is /bookmarks. Segments are encoded one by one
 * so a "/" inside a folder name stays inside it. A name made only of dots — one
 * folder is called "." — would be resolved away by the browser as a dot segment,
 * and "%2E" counts as one too, so it gets a leading "~" that folderPath removes.
 */
export function folderUrl(path: string[]): string {
  const segment = (name: string) => (/^\.+$/.test(name) ? '~' + name : encodeURIComponent(name));
  return path.length === 0 ? '/bookmarks' : '/bookmarks/' + path.map(segment).join('/');
}

/**
 * The folder path a folderUrl() wildcard stands for
 */
export function folderPath(rest: string | null | undefined): string[] {
  if (!rest) return [];
  return rest
    .split('/')
    .filter(Boolean)
    .map((seg) => (/^~\.+$/.test(seg) ? seg.slice(1) : decodeURIComponent(seg)));
}

/**
 * A day as "19 Jan 2026"
 */
export function formatDay(ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * How long ago, in the largest unit that reads naturally: "3 days ago", "8 months ago"
 */
export function timeAgo(ms: number, now: number = Date.now()): string {
  const days = (now - ms) / 86_400_000;
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (days < 1) return 'today';
  if (days < 14) return rtf.format(-Math.round(days), 'day');
  if (days < 60) return rtf.format(-Math.round(days / 7), 'week');
  if (days < 365 * 1.5) return rtf.format(-Math.round(days / 30.44), 'month');
  return rtf.format(-Math.round(days / 365.25), 'year');
}
