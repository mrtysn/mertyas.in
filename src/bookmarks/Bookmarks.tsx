import { useState, useMemo } from 'react';
import { getAllBookmarks, getBookmarksByFolder } from '../utils/bookmarks';
import BookmarksGrid from './BookmarksGrid';
import BookmarksToolbar from './BookmarksToolbar';
import './bookmarks.css';

function Bookmarks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string[]>([]);

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

  // Apply search filter
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery) return bookmarks;
    const query = searchQuery.toLowerCase();
    return bookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query) ||
        b.tags.some((t) => t.toLowerCase().includes(query))
    );
  }, [bookmarks, searchQuery]);

  return (
    <div>
      <h2>Bookmarks</h2>

      {/* Breadcrumb navigation */}
      <nav className="bookmarks-breadcrumb">
        <a onClick={() => setCurrentFolder([])}>All</a>
        {currentFolder.map((folder, idx) => (
          <span key={idx}>
            <span> / </span>
            <a onClick={() => setCurrentFolder(currentFolder.slice(0, idx + 1))}>
              {folder}
            </a>
          </span>
        ))}
      </nav>

      <BookmarksToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={filteredBookmarks.length}
      />

      <BookmarksGrid
        bookmarks={filteredBookmarks}
        folders={subfolders}
        onFolderClick={(folderName) =>
          setCurrentFolder([...currentFolder, folderName])
        }
      />
    </div>
  );
}

export default Bookmarks;
