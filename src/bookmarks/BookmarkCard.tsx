import { useState } from 'react';
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

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString();
}

function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isDead = bookmark.statusCode !== undefined &&
    (bookmark.statusCode === 0 || bookmark.statusCode >= 400);
  const hasArchive = !!bookmark.archiveUrl;
  const href = isDead && hasArchive ? bookmark.archiveUrl! : bookmark.url;

  return (
    <article className={`bookmark-card${expanded ? ' expanded' : ''}${bookmark.previewImage ? ' has-preview' : ''}`}>
      {bookmark.previewImage && (
        <div className="bookmark-preview">
          <img src={bookmark.previewImage} alt="" loading="lazy" />
        </div>
      )}
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
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

          {bookmark.statusCode !== undefined && bookmark.statusCode > 0 && (
            <span className={`status status-${getStatusClass(bookmark.statusCode)}`}>
              {bookmark.statusCode}
            </span>
          )}

          {hasArchive && (
            <span className="status status-archived">archived</span>
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

      <button
        className="bookmark-expand-btn"
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        aria-label={expanded ? 'Collapse details' : 'Expand details'}
      >
        {expanded ? '\u25B2' : '\u25BC'}
      </button>

      {expanded && (
        <div className="bookmark-details">
          <div className="detail-row">
            <span className="detail-label">URL</span>
            <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="detail-value detail-url">
              {bookmark.url}
            </a>
          </div>
          {bookmark.description && (
            <div className="detail-row">
              <span className="detail-label">Description</span>
              <span className="detail-value">{bookmark.description}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Added</span>
            <span className="detail-value">{formatDate(bookmark.addDate)}</span>
          </div>
          {bookmark.archiveUrl && (
            <div className="detail-row">
              <span className="detail-label">Archive</span>
              <a href={bookmark.archiveUrl} target="_blank" rel="noopener noreferrer" className="detail-value detail-url">
                Wayback Machine
              </a>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Folder</span>
            <span className="detail-value">{bookmark.folderPath.join(' / ')}</span>
          </div>
        </div>
      )}
    </article>
  );
}

export default BookmarkCard;
