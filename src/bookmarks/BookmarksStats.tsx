import { useMemo } from 'react';
import type { Bookmark } from '../utils/types';

interface BookmarksStatsProps {
  bookmarks: Bookmark[];
}

function BookmarksStats({ bookmarks }: BookmarksStatsProps) {
  const stats = useMemo(() => {
    let live = 0, dead = 0, archived = 0, unchecked = 0;
    const domains = new Map<string, number>();

    for (const b of bookmarks) {
      // Status
      if (b.statusCode === undefined) {
        unchecked++;
      } else if (b.statusCode >= 200 && b.statusCode < 400) {
        live++;
      } else {
        dead++;
      }
      if (b.archiveUrl) archived++;

      // Domains
      try {
        const host = new URL(b.url).hostname;
        domains.set(host, (domains.get(host) || 0) + 1);
      } catch { /* skip invalid URLs */ }
    }

    const topDomains = Array.from(domains.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return { total: bookmarks.length, live, dead, archived, unchecked, topDomains };
  }, [bookmarks]);

  return (
    <div className="bookmarks-stats">
      <div className="stats-row">
        <div className="stat">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat">
          <span className="stat-value stat-live">{stats.live}</span>
          <span className="stat-label">Live</span>
        </div>
        <div className="stat">
          <span className="stat-value stat-dead">{stats.dead}</span>
          <span className="stat-label">Dead</span>
        </div>
        <div className="stat">
          <span className="stat-value stat-archived">{stats.archived}</span>
          <span className="stat-label">Archived</span>
        </div>
        <div className="stat">
          <span className="stat-value stat-unchecked">{stats.unchecked}</span>
          <span className="stat-label">Unchecked</span>
        </div>
      </div>

      {stats.topDomains.length > 0 && (
        <details className="stats-domains">
          <summary>Top domains</summary>
          <ul>
            {stats.topDomains.map(([domain, count]) => (
              <li key={domain}>
                <span className="domain-name">{domain}</span>
                <span className="domain-count">{count}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export default BookmarksStats;
