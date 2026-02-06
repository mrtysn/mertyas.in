export interface PostFrontmatter {
  title: string;
  date?: string;
  description: string;
  tags: string[];
  draft?: boolean;
  image?: string;
}

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  html: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  addDate: number;
  lastModified?: number;
  icon?: string;
  tags: string[];
  folderPath: string[];
  lastChecked?: number;
  statusCode?: number;
  checkError?: string;
  firefoxGuid?: string;
  source: 'firefox' | 'manual';
  locallyModified?: boolean;
  archiveUrl?: string;
  description?: string;
  previewImage?: string;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  path: string[];
  bookmarks: Bookmark[];
  subfolders: BookmarkFolder[];
  firefoxGuid?: string;
}

export interface SyncHistoryEntry {
  date: number;
  source: string;
  added: number;
  updated: number;
  unchanged: number;
}

export interface BookmarksData {
  version: string;
  importDate: number;
  root: BookmarkFolder;
  flatBookmarks: Bookmark[];
  buildInfo: {
    totalBookmarks: number;
    checkedCount: number;
    previewsGenerated: number;
    lastBuild: number;
  };
  syncInfo?: {
    lastImportSource?: string;
    lastImportDate?: number;
    importHistory: SyncHistoryEntry[];
  };
}

export interface BookmarkCache {
  version: string;
  bookmarks: {
    [id: string]: {
      url: string;
      lastModified: number;
      linkCheck?: {
        statusCode: number;
        checkedAt: number;
        error?: string;
      };
    };
  };
}
