import { formatDay } from '../utils/bookmarks';
import type { Bookmark } from '../utils/types';

// Written by `pnpm run bookmarks:favicons` from the local Firefox profile:
// bookmark URL -> icon path, and the theme each too-dark or too-light icon
// would vanish into. Optional: without it the rows simply have no icons.
interface Favicons {
  icons: Record<string, string>;
  fadesOn: Record<string, 'dark' | 'light'>;
}
const faviconFiles = import.meta.glob<Favicons>('./data/favicons.json', { eager: true, import: 'default' });
const { icons, fadesOn }: Favicons = Object.values(faviconFiles)[0] ?? { icons: {}, fadesOn: {} };

interface BookmarksListProps {
  bookmarks: Bookmark[];
  /** Whether a search, tag or status filter is narrowing the folder. */
  filtered: boolean;
  query: string;
  onClearFilters: () => void;
  /** Whether the folder holds subfolders, for an empty folder's pointer. */
  hasSubfolders: boolean;
}

function isDead(b: Bookmark): boolean {
  return b.statusCode !== undefined && (b.statusCode === 0 || b.statusCode >= 400);
}

/** Up is the normal case and says nothing; only the exceptions get a word. */
function statusOf(b: Bookmark): { text: string; dead: boolean } | null {
  if (isDead(b) && b.archiveUrl) return { text: 'archived', dead: false };
  if (!isDead(b)) return null;
  return { text: b.statusCode === 0 ? 'down' : String(b.statusCode), dead: true };
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/** One line per bookmark: title, address, status when it is not simply up, and
 *  any tags beyond the folder it already sits in — which is what almost every
 *  tag is. */
function BookmarksList({ bookmarks, filtered, query, onClearFilters, hasSubfolders }: BookmarksListProps) {
  if (bookmarks.length === 0) {
    return (
      <p className="bookmarks-list bookmarks-empty">
        {filtered ? (
          <>
            {query ? `No bookmarks here match “${query}”.` : 'No bookmarks here match these filters.'}
            <button type="button" onClick={onClearFilters}>
              Clear search and filters
            </button>
          </>
        ) : hasSubfolders ? (
          'Nothing sits directly in this folder; its subfolders are in the tree.'
        ) : (
          'No bookmarks in this folder.'
        )}
      </p>
    );
  }

  return (
    <ul className="bookmarks-list">
      {bookmarks.map((b) => {
        const status = statusOf(b);
        const href = isDead(b) && b.archiveUrl ? b.archiveUrl : b.url;
        const title = b.title === 'Unnamed Bookmark' ? hostname(b.url) : b.title;
        const tags = b.tags.filter((t) => !b.folderPath.includes(t));
        return (
          <li key={b.id}>
            {/* Always present, so rows without an icon keep their titles aligned. */}
            <span
              className={`bookmark-icon${icons[b.url] && fadesOn[icons[b.url]] ? ` fades-on-${fadesOn[icons[b.url]]}` : ''}`}
            >
              {icons[b.url] && (
                <img src={icons[b.url]} alt="" width={16} height={16} loading="lazy" decoding="async" />
              )}
            </span>
            {/* Titles and addresses truncate; the tooltip keeps the whole of each. */}
            <a href={href} target="_blank" rel="noopener noreferrer" title={title}>
              {title}
            </a>
            <small title={b.url}>{b.url.replace(/^[a-z]+:\/\//i, '').replace(/\/$/, '')}</small>
            <small
              className={status?.dead ? 'bookmark-dead' : undefined}
              title={
                status && b.lastChecked
                  ? `${b.checkError ?? status.text} · checked ${formatDay(b.lastChecked)}`
                  : undefined
              }
            >
              {status?.text}
            </small>
            <small>{tags.join(' ')}</small>
          </li>
        );
      })}
    </ul>
  );
}

export default BookmarksList;
