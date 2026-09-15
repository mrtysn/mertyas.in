import { formatDay, timeAgo } from '../utils/bookmarks';

export type StatusFilter = 'all' | 'live' | 'dead' | 'archived' | 'unchecked';
export type SortOption = 'date-desc' | 'date-asc' | 'alpha' | 'recently-checked';

interface BookmarksToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  /** Bookmarks under each status among those the search leaves. */
  statusCounts: Record<StatusFilter, number>;
  /** Span of the last link checks, in ms; null when nothing was checked. */
  checked: { first: number; last: number } | null;
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

function checkedWhen({ first, last }: { first: number; last: number }): string {
  const day = formatDay(last);
  return formatDay(first) === day ? day : `${formatDay(first)} – ${day}`;
}

function BookmarksToolbar({
  searchQuery,
  onSearchChange,
  totalCount,
  statusCounts,
  checked,
  statusFilter,
  onStatusFilterChange,
  sortOption,
  onSortChange,
}: BookmarksToolbarProps) {
  return (
    <>
      <div className="bookmarks-toolbar">
        <input
          type="search"
          placeholder="Search bookmarks…"
          aria-label="Search bookmarks"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bookmarks-search"
        />
        {/* Status last: its width follows the counts, and with nothing after
            it a folder change moves no other control. */}
        <div className="bookmarks-filters" role="group" aria-label="Link status">
          {(Object.keys(filterLabels) as StatusFilter[]).map((f) => (
            <button
              key={f}
              className={`filter-btn${statusFilter === f ? ' active' : ''}`}
              aria-pressed={statusFilter === f}
              onClick={() => onStatusFilterChange(f)}
            >
              {filterLabels[f]} <small>{statusCounts[f]}</small>
            </button>
          ))}
        </div>
      </div>
      {/* Sort sits with the count, right above the list it orders; the row
          of controls above keeps to search and status. */}
      <div className="bookmarks-meta">
        <p>
          {totalCount} bookmark{totalCount !== 1 ? 's' : ''}
          {checked && (
            <>
              {' · links checked '}
              <time dateTime={new Date(checked.last).toISOString()}>{checkedWhen(checked)}</time>
              {`, ${timeAgo(checked.last)}`}
            </>
          )}
        </p>
        <select
          className="bookmarks-sort"
          aria-label="Sort bookmarks"
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          {(Object.keys(sortLabels) as SortOption[]).map((s) => (
            <option key={s} value={s}>{sortLabels[s]}</option>
          ))}
        </select>
      </div>
    </>
  );
}

export default BookmarksToolbar;
