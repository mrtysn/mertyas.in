import type { Bookmark, BookmarkFolder } from '../utils/types';
import BookmarkCard from './BookmarkCard';
import FolderCard from './FolderCard';

interface BookmarksGridProps {
  bookmarks: Bookmark[];
  folders: BookmarkFolder[];
  onFolderClick: (folderName: string) => void;
}

function BookmarksGrid({ bookmarks, folders, onFolderClick }: BookmarksGridProps) {
  return (
    <div className="bookmarks-grid">
      {folders.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          onClick={() => onFolderClick(folder.name)}
        />
      ))}

      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}

      {bookmarks.length === 0 && folders.length === 0 && (
        <p>No bookmarks found.</p>
      )}
    </div>
  );
}

export default BookmarksGrid;
