import type { Bookmark } from '../utils/types';

interface BookmarkCardProps {
  bookmark: Bookmark;
}

function getStatusClass(code: number): string {
  if (code >= 200 && code < 300) return 'success';
  if (code >= 300 && code < 400) return 'redirect';
  if (code >= 400 && code < 500) return 'client-error';
  if (code >= 500) return 'server-error';
  return 'unknown';
}

function BookmarkCard({ bookmark }: BookmarkCardProps) {
  return (
    <article className="bookmark-card">
      <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
        <div className="bookmark-favicon">
          {bookmark.icon ? (
            <img src={bookmark.icon} alt="" />
          ) : (
            <div className="bookmark-placeholder">
              {bookmark.title.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="bookmark-info">
          <h3>{bookmark.title}</h3>
          <small className="bookmark-url">
            {new URL(bookmark.url).hostname}
          </small>

          {bookmark.statusCode && (
            <span className={`status status-${getStatusClass(bookmark.statusCode)}`}>
              {bookmark.statusCode}
            </span>
          )}

          {bookmark.tags.length > 0 && (
            <div className="bookmark-tags">
              {bookmark.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </a>
    </article>
  );
}

export default BookmarkCard;
