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
}

export interface BookmarkFolder {
  id: string;
  name: string;
  path: string[];
  bookmarks: Bookmark[];
  subfolders: BookmarkFolder[];
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
