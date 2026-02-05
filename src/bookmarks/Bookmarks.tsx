import { useState, useMemo } from 'react';
import { useParams, useLocation } from 'wouter';
import { getAllBookmarks, getBookmarksByFolder } from '../utils/bookmarks';
import BookmarksGrid from './BookmarksGrid';
import BookmarksToolbar from './BookmarksToolbar';
import TagCloud from './TagCloud';
import BookmarksStats from './BookmarksStats';
import type { StatusFilter, SortOption } from './BookmarksToolbar';
import type { Bookmark } from '../utils/types';
import './bookmarks.css';

function applyStatusFilter(bookmarks: Bookmark[], filter: StatusFilter): Bookmark[] {
  switch (filter) {
    case 'live':
      return bookmarks.filter(b => b.statusCode !== undefined && b.statusCode >= 200 && b.statusCode < 400);
    case 'dead':
      return bookmarks.filter(b => b.statusCode !== undefined && (b.statusCode === 0 || b.statusCode >= 400) && !b.archiveUrl);
    case 'archived':
      return bookmarks.filter(b => !!b.archiveUrl);
    case 'unchecked':
      return bookmarks.filter(b => b.statusCode === undefined);
    default:
      return bookmarks;
  }
}

function sortBookmarks(bookmarks: Bookmark[], sort: SortOption): Bookmark[] {
  const sorted = [...bookmarks];
  switch (sort) {
    case 'date-desc':
      return sorted.sort((a, b) => b.addDate - a.addDate);
    case 'date-asc':
      return sorted.sort((a, b) => a.addDate - b.addDate);
    case 'alpha':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'recently-checked':
      return sorted.sort((a, b) => (b.lastChecked || 0) - (a.lastChecked || 0));
    default:
      return sorted;
  }
}

function Bookmarks() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [activeTag, setActiveTag] = useState('');
  const [showStats, setShowStats] = useState(false);

  // Derive folder path from URL params
  const currentFolder = useMemo(() => {
    const rest = params.rest;
    if (!rest) return [];
    return decodeURIComponent(rest).split('/').filter(Boolean);
  }, [params.rest]);

  const bookmarksData = getAllBookmarks();

  // Get bookmarks for current folder
  const { bookmarks, subfolders } = useMemo(() => {
    if (currentFolder.length === 0) {
      return {
        bookmarks: bookmarksData.flatBookmarks.filter(
          (b) => b.folderPath.length === 1
        ),
        subfolders: bookmarksData.root.subfolders,
      };
    }
    return getBookmarksByFolder(bookmarksData, currentFolder);
  }, [bookmarksData, currentFolder]);

  // Apply search filter (includes description)
  const searchFiltered = useMemo(() => {
    let result = bookmarks;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query) ||
          b.tags.some((t) => t.toLowerCase().includes(query)) ||
          (b.description && b.description.toLowerCase().includes(query))
      );
    }
    if (activeTag) {
      result = result.filter(b => b.tags.includes(activeTag));
    }
    return result;
  }, [bookmarks, searchQuery, activeTag]);

  // Apply status filter
  const statusFiltered = useMemo(
    () => applyStatusFilter(searchFiltered, statusFilter),
    [searchFiltered, statusFilter]
  );

  // Apply sort
  const filteredBookmarks = useMemo(
    () => sortBookmarks(statusFiltered, sortOption),
    [statusFiltered, sortOption]
  );

  function navigateToFolder(path: string[]) {
    if (path.length === 0) {
      setLocation('/bookmarks');
    } else {
      setLocation('/bookmarks/' + path.map(encodeURIComponent).join('/'));
    }
  }

  return (
    <div>
      <div className="bookmarks-header">
        <h2>Bookmarks</h2>
        <button
          className="stats-toggle"
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? 'Hide stats' : 'Stats'}
        </button>
      </div>

      {showStats && <BookmarksStats bookmarks={bookmarksData.flatBookmarks} />}

      {/* Breadcrumb navigation */}
      <nav className="bookmarks-breadcrumb">
        <a onClick={() => navigateToFolder([])}>All</a>
        {currentFolder.map((folder, idx) => (
          <span key={idx}>
            <span> / </span>
            <a onClick={() => navigateToFolder(currentFolder.slice(0, idx + 1))}>
              {folder}
            </a>
          </span>
        ))}
      </nav>

      <BookmarksToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={filteredBookmarks.length}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      <TagCloud
        bookmarks={bookmarks}
        onTagClick={setActiveTag}
        activeTag={activeTag}
      />

      <BookmarksGrid
        bookmarks={filteredBookmarks}
        folders={subfolders}
        onFolderClick={(folderName) =>
          navigateToFolder([...currentFolder, folderName])
        }
      />
    </div>
  );
}

export default Bookmarks;
