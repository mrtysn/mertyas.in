import { formatDay } from '../utils/bookmarks';
import type { Bookmark } from '../utils/types';

interface BookmarksListProps {
  bookmarks: Bookmark[];
  /** Whether a search or status filter is narrowing the folder. */
  filtered: boolean;
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
function BookmarksList({ bookmarks, filtered }: BookmarksListProps) {
  if (bookmarks.length === 0) {
    return (
      <p className="bookmarks-list bookmarks-empty">
        {filtered ? 'No bookmarks here match the search and status.' : 'No bookmarks in this folder.'}
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
