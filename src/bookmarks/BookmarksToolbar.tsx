export type StatusFilter = 'all' | 'live' | 'dead' | 'archived' | 'unchecked';
export type SortOption = 'date-desc' | 'date-asc' | 'alpha' | 'recently-checked';

interface BookmarksToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const filterLabels: Record<StatusFilter, string> = {
  all: 'All',
  live: 'Live',
  dead: 'Dead',
  archived: 'Archived',
  unchecked: 'Unchecked',
};

const sortLabels: Record<SortOption, string> = {
  'date-desc': 'Newest first',
  'date-asc': 'Oldest first',
  'alpha': 'A-Z',
  'recently-checked': 'Recently checked',
};

function BookmarksToolbar({
  searchQuery,
  onSearchChange,
  totalCount,
  statusFilter,
  onStatusFilterChange,
  sortOption,
  onSortChange,
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
      <div className="bookmarks-filters">
        {(Object.keys(filterLabels) as StatusFilter[]).map((f) => (
          <button
            key={f}
            className={`filter-btn${statusFilter === f ? ' active' : ''}`}
            onClick={() => onStatusFilterChange(f)}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>
      <select
        className="bookmarks-sort"
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
      >
        {(Object.keys(sortLabels) as SortOption[]).map((s) => (
          <option key={s} value={s}>{sortLabels[s]}</option>
        ))}
      </select>
      <small className="bookmarks-count">
        {totalCount} bookmark{totalCount !== 1 ? 's' : ''}
      </small>
    </div>
  );
}

export default BookmarksToolbar;
