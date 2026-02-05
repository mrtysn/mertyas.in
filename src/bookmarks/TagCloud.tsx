import type { Bookmark } from '../utils/types';

interface TagCloudProps {
  bookmarks: Bookmark[];
  onTagClick: (tag: string) => void;
  activeTag?: string;
}

function TagCloud({ bookmarks, onTagClick, activeTag }: TagCloudProps) {
  // Count tag frequencies
  const tagCounts = new Map<string, number>();
  for (const b of bookmarks) {
    for (const tag of b.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  // Sort by frequency descending, take top 30
  const sorted = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);

  if (sorted.length === 0) return null;

  const maxCount = sorted[0][1];
  const minCount = sorted[sorted.length - 1][1];

  function getSize(count: number): string {
    if (maxCount === minCount) return '1rem';
    const ratio = (count - minCount) / (maxCount - minCount);
    const size = 0.75 + ratio * 0.75;
    return `${size}rem`;
  }

  return (
    <div className="tag-cloud">
      {sorted.map(([tag, count]) => (
        <button
          key={tag}
          className={`tag-cloud-item${activeTag === tag ? ' active' : ''}`}
          style={{ fontSize: getSize(count) }}
          onClick={() => onTagClick(activeTag === tag ? '' : tag)}
          title={`${count} bookmark${count !== 1 ? 's' : ''}`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

export default TagCloud;
