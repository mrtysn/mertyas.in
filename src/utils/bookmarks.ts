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
      version: '2.0.0',
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
