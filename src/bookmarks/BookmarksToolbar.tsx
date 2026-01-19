interface BookmarksToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
}

function BookmarksToolbar({
  searchQuery,
  onSearchChange,
  totalCount,
}: BookmarksToolbarProps) {
  return (
    <div className="bookmarks-toolbar">
      <input
        type="search"
        placeholder="Search bookmarks..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="bookmarks-search"
      />
      <small className="bookmarks-count">
        {totalCount} bookmark{totalCount !== 1 ? 's' : ''}
      </small>
    </div>
  );
}

export default BookmarksToolbar;
