import type { BookmarkFolder } from '../utils/types';

interface FolderCardProps {
  folder: BookmarkFolder;
  onClick: () => void;
}

function FolderCard({ folder, onClick }: FolderCardProps) {
  const bookmarkCount =
    folder.bookmarks.length +
    folder.subfolders.reduce((sum, f) => sum + f.bookmarks.length, 0);

  return (
    <article className="folder-card" onClick={onClick}>
      <div className="folder-icon">📁</div>
      <div className="folder-info">
        <h3>{folder.name}</h3>
        <small>
          {bookmarkCount} bookmark{bookmarkCount !== 1 ? 's' : ''}
        </small>
      </div>
    </article>
  );
}

export default FolderCard;
