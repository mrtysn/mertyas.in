import { useLayoutEffect, useState, type MouseEvent } from 'react';
import { folderUrl } from '../utils/bookmarks';
import type { BookmarkFolder } from '../utils/types';

interface BookmarksTreeProps {
  root: BookmarkFolder;
  /** Path of the open folder; empty at the root. */
  current: string[];
  onOpen: (path: string[]) => void;
}

function countAll(folder: BookmarkFolder): number {
  return folder.bookmarks.length + folder.subfolders.reduce((n, f) => n + countAll(f), 0);
}

const keyOf = (path: string[]) => path.join('/');

/** Real links, so the tree is reachable by keyboard and a folder opens in a new
 *  tab on a modified click; a plain click stays in the page. */
function inPage(ev: MouseEvent, run: () => void) {
  if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
  ev.preventDefault();
  run();
}

/** Every folder you have unfolded, as a tree. Opening a folder unfolds it where
 *  it stands and leaves every other branch as it was — nothing above the name
 *  you clicked ever moves, so it stays under the pointer. Clicking the folder
 *  that is already open folds it back up. Empty folders are left out; counts
 *  include everything inside. */
function BookmarksTree({ root, current, onOpen }: BookmarksTreeProps) {
  const [unfolded, setUnfolded] = useState<Set<string>>(
    () => new Set(current.map((_, i) => keyOf(current.slice(0, i + 1))))
  );

  // However the folder was reached — a click, a typed URL, back and forward —
  // the way to it is unfolded. A layout effect, so it never paints folded.
  useLayoutEffect(() => {
    setUnfolded((prev) => {
      const missing = current.map((_, i) => keyOf(current.slice(0, i + 1))).filter((k) => !prev.has(k));
      return missing.length === 0 ? prev : new Set([...prev, ...missing]);
    });
  }, [current]);

  function toggle(key: string) {
    setUnfolded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function level(folders: BookmarkFolder[]) {
    const shown = folders.filter((f) => countAll(f) > 0);
    if (shown.length === 0) return null;
    return (
      <ul>
        {shown.map((folder) => {
          const key = keyOf(folder.path);
          const isCurrent = key === keyOf(current);
          return (
            <li key={folder.id}>
              <a
                href={folderUrl(folder.path)}
                className={isCurrent ? 'current' : undefined}
                aria-current={isCurrent ? 'page' : undefined}
                aria-expanded={folder.subfolders.length > 0 ? unfolded.has(key) : undefined}
                onClick={(ev) => inPage(ev, () => (isCurrent ? toggle(key) : onOpen(folder.path)))}
              >
                {folder.name} <small>{countAll(folder)}</small>
              </a>
              {unfolded.has(key) && level(folder.subfolders)}
            </li>
          );
        })}
      </ul>
    );
  }

  // A list, not a <nav>: classless styles nav lists as the site's dropdown
  // menu — nested lists hidden until hover, top-level items inline.
  return (
    <ul className="bookmarks-tree">
      <li>
        <a
          href={folderUrl([])}
          className={current.length === 0 ? 'current' : undefined}
          aria-current={current.length === 0 ? 'page' : undefined}
          onClick={(ev) => inPage(ev, () => onOpen([]))}
        >
          All <small>{countAll(root)}</small>
        </a>
        {level(root.subfolders)}
      </li>
    </ul>
  );
}

export default BookmarksTree;
