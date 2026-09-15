import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { folderPath, folderUrl, getAllBookmarks, getBookmarksByFolder } from '../utils/bookmarks';
import BookmarksList from './BookmarksList';
import BookmarksTree from './BookmarksTree';
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
  const rest = params["*"];
  const currentFolder = useMemo(() => folderPath(rest), [rest]);

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

  // How many of what is showing fall under each status, so a filter says what it
  // would leave before it is clicked.
  const statusCounts = useMemo(() => {
    const counts = {} as Record<StatusFilter, number>;
    for (const f of ['all', 'live', 'dead', 'archived', 'unchecked'] as StatusFilter[]) {
      counts[f] = applyStatusFilter(searchFiltered, f).length;
    }
    return counts;
  }, [searchFiltered]);

  // When the links were last checked. Live and dead are only as current as that.
  const checked = useMemo(() => {
    const times = bookmarksData.flatBookmarks
      .map((b) => b.lastChecked)
      .filter((t): t is number => t !== undefined);
    return times.length ? { first: Math.min(...times), last: Math.max(...times) } : null;
  }, [bookmarksData]);

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

  // Opening a folder from far down a long list starts the new one at its top,
  // placed so the sticky sidebar does not shift as the page moves.
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const top = body.current?.getBoundingClientRect().top ?? 0;
    const sticky = parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (top < sticky) window.scrollBy(0, top - sticky);
  }, [rest]);

  function navigateToFolder(path: string[]) {
    setLocation(folderUrl(path));
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

      <BookmarksToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={filteredBookmarks.length}
        statusCounts={statusCounts}
        checked={checked}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      {/* Folders and tags beside the list rather than above it: nothing that
          changes as you browse sits over the list, so the list never moves. */}
      <div className="bookmarks-body" ref={body}>
        <aside className="bookmarks-side" aria-label="Folders and tags">
          <BookmarksTree
            root={bookmarksData.root}
            current={currentFolder}
            onOpen={navigateToFolder}
          />
          <TagCloud
            bookmarks={bookmarks}
            onTagClick={setActiveTag}
            activeTag={activeTag}
          />
        </aside>
        <BookmarksList
          bookmarks={filteredBookmarks}
          filtered={searchQuery !== '' || activeTag !== '' || statusFilter !== 'all'}
          query={searchQuery}
          onClearFilters={() => {
            setSearchQuery('');
            setActiveTag('');
            setStatusFilter('all');
          }}
          hasSubfolders={subfolders.length > 0}
        />
      </div>
    </div>
  );
}

export default Bookmarks;
