# Bookmarks Section Implementation Plan

## Phase 1: Basic Implementation (Favicons Only)

Add a bookmarks section to mertyas.in that imports Firefox bookmarks HTML, displays them in a grid layout with favicons, and maintains folder structure with searchable tags.

## User Requirements
1. Import from Firefox HTML export (bookmarks.html)
2. Grid layout with favicons (preview screenshots in Phase 2)
3. Preserve folder hierarchy AND support tags
4. Build-time link checking
5. Re-importable (can export from Firefox again in 3 months and update)

## Phase 1 Scope
- ✅ Parse Firefox HTML bookmarks
- ✅ Generate JSON data structure
- ✅ Build-time link checking (HTTP HEAD requests)
- ✅ Grid UI with favicons from Firefox export
- ✅ Folder navigation
- ✅ Search/filtering by title, URL, tags
- ❌ Preview screenshots (Phase 2)
- ❌ Build cache for previews (Phase 2)

## Architecture

### Data Flow (Phase 1)
```
Firefox Export (bookmarks.html)
  ↓
Parse HTML → Extract bookmarks/folders + favicons
  ↓
Generate JSON structure + stable IDs
  ↓
Build-time: Check links (HTTP HEAD)
  ↓
React UI: Grid layout with favicons + folder navigation
```

### Build Integration (Phase 1)
```
pnpm build
  ↓
tsc -b
  ↓
vite build
  ↓
tsx scripts/generate-feeds.ts
  ↓
tsx scripts/bookmarks/build-bookmarks.ts
  (parses HTML, generates JSON, checks links - no Puppeteer)
```

## Data Structures

### Core Types (add to `/src/utils/types.ts`)

```typescript
export interface Bookmark {
  id: string;                    // SHA-256 hash of url+title (stable across imports)
  title: string;
  url: string;
  addDate: number;               // Unix timestamp from Firefox
  lastModified?: number;
  icon?: string;                 // Base64 favicon from Firefox
  tags: string[];                // Auto-generated from folder path
  folderPath: string[];          // e.g., ["Bookmarks Bar", "Development", "React"]

  // Build-time generated (Phase 1)
  lastChecked?: number;          // When link was checked
  statusCode?: number;           // HTTP status: 200, 404, 500, etc.
  checkError?: string;

  // Phase 2 (not in Phase 1)
  // previewImage?: string;      // Path: /bookmarks/previews/${id}.jpg
}

export interface BookmarkFolder {
  id: string;
  name: string;
  path: string[];
  bookmarks: Bookmark[];
  subfolders: BookmarkFolder[];
}

export interface BookmarksData {
  version: string;
  importDate: number;
  root: BookmarkFolder;
  flatBookmarks: Bookmark[];     // Flattened for easy search
  buildInfo: {
    totalBookmarks: number;
    checkedCount: number;
    previewsGenerated: number;
    lastBuild: number;
  };
}

// Link check cache (Phase 1 - no preview cache yet)
export interface BookmarkCache {
  version: string;
  bookmarks: {
    [id: string]: {
      url: string;
      lastModified: number;
      linkCheck?: {
        statusCode: number;
        checkedAt: number;
        error?: string;
      };
    };
  };
}
```

## Implementation Steps

### 1. Script Organization (`/scripts/bookmarks/`) - Phase 1

```
scripts/bookmarks/
├── build-bookmarks.ts           # Main orchestrator
├── parse-firefox-html.ts        # Parse Firefox HTML structure
├── generate-bookmarks-data.ts   # Convert to JSON + generate IDs
├── check-links.ts               # HTTP HEAD requests
└── utils/
    ├── cache-manager.ts         # Read/write link check cache
    └── hash-utils.ts            # Generate stable IDs

# Phase 2 (not in Phase 1):
# ├── generate-previews.ts       # Puppeteer screenshots
# └── utils/screenshot.ts        # Puppeteer wrapper
```

### 2. Main Build Script (`build-bookmarks.ts`) - Phase 1

```typescript
async function buildBookmarks(options: {
  inputHtml?: string,            // Path to bookmarks.html
  skipLinkCheck?: boolean
}) {
  // 1. If inputHtml provided, parse Firefox HTML and generate bookmarks.json
  if (options.inputHtml) {
    const parsed = parseFirefoxHtml(options.inputHtml);
    generateBookmarksData(parsed);
  }

  // 2. Load existing bookmarks.json + cache
  const data = loadBookmarksData();
  const cache = loadCache();

  // 3. Check links (re-check after 7 days)
  if (!options.skipLinkCheck) {
    await checkLinks(data.flatBookmarks, cache, {
      recheckAfterDays: 7,
      maxConcurrent: 10
    });
  }

  // 4. Update bookmarks.json with build metadata
  updateBuildMetadata(data, cache);
}
```

### 3. Firefox HTML Parser (`parse-firefox-html.ts`)

Firefox exports in this format:
```html
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
  <DT><H3 ADD_DATE="..." LAST_MODIFIED="...">Folder Name</H3>
  <DL><p>
    <DT><A HREF="https://..." ADD_DATE="..." ICON="data:image/...">Link Title</A>
  </DL><p>
</DL><p>
```

Parse using JSDOM/cheerio:
- `<H3>` tags = folders
- `<A>` tags = bookmarks
- Nested `<DL>` = subfolder contents
- Extract attributes: HREF, ADD_DATE, LAST_MODIFIED, ICON

### 4. Data Generation (`generate-bookmarks-data.ts`)

```typescript
function generateBookmarksData(parsedTree: ParsedNode): void {
  // 1. Generate stable IDs: SHA-256(url + title).substring(0, 16)
  // 2. Flatten tree and extract folder paths
  // 3. Auto-generate tags from folder names (lowercase)
  // 4. Create BookmarkFolder hierarchy
  // 5. Write to /src/bookmarks/data/bookmarks.json
}
```

### 5. Link Checking (`check-links.ts`)

```typescript
async function checkLinks(
  bookmarks: Bookmark[],
  cache: BookmarkCache,
  options: { recheckAfterDays: number; maxConcurrent: number }
): Promise<void> {
  // Filter: not checked OR last check > 7 days ago
  const toCheck = bookmarks.filter(b => {
    const cached = cache.bookmarks[b.id]?.linkCheck;
    if (!cached) return true;
    const age = Date.now() - cached.checkedAt;
    return age > options.recheckAfterDays * 24 * 60 * 60 * 1000;
  });

  // Make HEAD requests in parallel (10 concurrent)
  await Promise.all(
    toCheck.map(async (bookmark) => {
      try {
        const response = await fetch(bookmark.url, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(5000)
        });

        cache.bookmarks[bookmark.id].linkCheck = {
          statusCode: response.status,
          checkedAt: Date.now()
        };
      } catch (error) {
        cache.bookmarks[bookmark.id].linkCheck = {
          statusCode: 0,
          checkedAt: Date.now(),
          error: error.message
        };
      }
    })
  );

  saveCache(cache);
}
```

### 6. Caching Strategy (Phase 1)

**Cache location:** `/src/bookmarks/data/.cache/bookmarks-cache.json`

**Incremental updates:**
When re-importing bookmarks.html:
1. Parse new HTML
2. Compare with existing bookmarks by ID
3. **Unchanged** (same URL, lastModified): Use cached link check
4. **Modified** (different URL/title): Re-check link
5. **New**: Check link
6. **Deleted**: Remove from data

**ID Generation:**
```typescript
function generateBookmarkId(url: string, title: string): string {
  return crypto.createHash('sha256')
    .update(`${url}::${title}`)
    .digest('hex')
    .substring(0, 16);
}
```

Stable IDs ensure same bookmark gets same preview across imports.

### 7. UI Components (`/src/bookmarks/`) - Phase 1

```
src/bookmarks/
├── Bookmarks.tsx              # Main route component
├── BookmarksGrid.tsx          # Grid container
├── BookmarkCard.tsx           # Individual bookmark tile
├── FolderCard.tsx             # Folder tile (navigation)
├── BookmarksToolbar.tsx       # Search/filter controls
├── BookmarkPreview.tsx        # Preview with fallback
├── bookmarks.css              # Grid styles
└── data/
    ├── bookmarks.json         # Generated by build
    └── .cache/
        └── bookmarks-cache.json
```

#### Main Component (`Bookmarks.tsx`)

```typescript
function Bookmarks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string[]>([]);

  const bookmarksData = getAllBookmarks(); // Vite glob import

  const { bookmarks, subfolders } = useMemo(() => {
    if (currentFolder.length === 0) {
      return {
        bookmarks: bookmarksData.flatBookmarks.filter(b => b.folderPath.length === 1),
        subfolders: bookmarksData.root.subfolders
      };
    }
    return getBookmarksByFolder(bookmarksData, currentFolder);
  }, [bookmarksData, currentFolder]);

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery) return bookmarks;
    const query = searchQuery.toLowerCase();
    return bookmarks.filter(b =>
      b.title.toLowerCase().includes(query) ||
      b.url.toLowerCase().includes(query) ||
      b.tags.some(t => t.toLowerCase().includes(query))
    );
  }, [bookmarks, searchQuery]);

  return (
    <div>
      <h2>Bookmarks</h2>

      {/* Breadcrumb navigation */}
      <nav className="bookmarks-breadcrumb">
        <a onClick={() => setCurrentFolder([])}>All</a>
        {currentFolder.map((folder, idx) => (
          <>
            <span> / </span>
            <a onClick={() => setCurrentFolder(currentFolder.slice(0, idx + 1))}>
              {folder}
            </a>
          </>
        ))}
      </nav>

      <BookmarksToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={filteredBookmarks.length}
      />

      <BookmarksGrid
        bookmarks={filteredBookmarks}
        folders={subfolders}
        onFolderClick={(name) => setCurrentFolder([...currentFolder, name])}
      />
    </div>
  );
}
```

#### Grid Layout (`BookmarksGrid.tsx`)

```typescript
function BookmarksGrid({ bookmarks, folders, onFolderClick }) {
  return (
    <div className="bookmarks-grid">
      {folders.map(folder => (
        <FolderCard
          key={folder.id}
          folder={folder}
          onClick={() => onFolderClick(folder.name)}
        />
      ))}

      {bookmarks.map(bookmark => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  );
}
```

#### Bookmark Card (`BookmarkCard.tsx`) - Phase 1

```typescript
function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  return (
    <article className="bookmark-card">
      <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
        {/* Phase 1: Show favicon only */}
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
          <small>{new URL(bookmark.url).hostname}</small>

          {bookmark.statusCode && (
            <span className={`status status-${getStatusClass(bookmark.statusCode)}`}>
              {bookmark.statusCode}
            </span>
          )}

          {bookmark.tags.length > 0 && (
            <div className="bookmark-tags">
              {bookmark.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </a>
    </article>
  );
}
```

#### Grid CSS (`bookmarks.css`) - Phase 1

```css
.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.bookmark-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.bookmark-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Phase 1: Favicon display */
.bookmark-favicon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.bookmark-favicon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.bookmark-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-muted);
}

.bookmark-info {
  flex: 1;
  min-width: 0;
}

.bookmark-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.tag {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background: var(--bg-secondary);
  border-radius: 4px;
}
```

### 8. Data Loading Utility (`/src/utils/bookmarks.ts`)

```typescript
import { BookmarksData } from './types';

const bookmarksFile = import.meta.glob<BookmarksData>(
  '../bookmarks/data/bookmarks.json',
  { eager: true, import: 'default' }
);

export function getAllBookmarks(): BookmarksData {
  const entries = Object.values(bookmarksFile);
  if (entries.length === 0) {
    return {
      version: '1.0.0',
      importDate: 0,
      root: { id: 'root', name: 'Root', path: [], bookmarks: [], subfolders: [] },
      flatBookmarks: [],
      buildInfo: { totalBookmarks: 0, checkedCount: 0, previewsGenerated: 0, lastBuild: 0 }
    };
  }
  return entries[0];
}

export function getBookmarksByFolder(
  data: BookmarksData,
  folderPath: string[]
): { bookmarks: Bookmark[], subfolders: BookmarkFolder[] } {
  let current = data.root;
  for (const segment of folderPath) {
    const subfolder = current.subfolders.find(f => f.name === segment);
    if (!subfolder) return { bookmarks: [], subfolders: [] };
    current = subfolder;
  }
  return { bookmarks: current.bookmarks, subfolders: current.subfolders };
}
```

### 9. Routing Integration

**Update `/src/routes.tsx`:**
```typescript
import Bookmarks from "./bookmarks/Bookmarks";

export const routes: RouteProps[] = [
  { path: "/", component: About },
  { path: "/projects", component: Projects },
  { path: "/bookmarks", component: Bookmarks },  // Add this
  { path: "/posts", component: Posts },
  { path: "/tags", component: Tags },
  { path: "/tags/:tag", component: Tag },
  { path: "/:slug", component: Post },
];
```

**Update `/src/home/Header.tsx`:**
```typescript
<li>
  <Link href="/bookmarks">Bookmarks</Link>
</li>
```

### 10. Build Integration - Phase 1

**Update `/package.json`:**
```json
{
  "scripts": {
    "build": "tsc -b && vite build && tsx scripts/generate-feeds.ts && tsx scripts/bookmarks/build-bookmarks.ts",
    "import:bookmarks": "tsx scripts/bookmarks/build-bookmarks.ts --input"
  },
  "devDependencies": {
    "jsdom": "^24.0.0",
    "@types/jsdom": "^21.1.6"
    // Note: No Puppeteer in Phase 1
  }
}
```

**CLI Usage:**
```bash
# Initial import
pnpm run import:bookmarks ~/Downloads/bookmarks.html

# Regular build (uses cached link checks)
pnpm build

# Skip link checking for quick builds
tsx scripts/bookmarks/build-bookmarks.ts --skip-link-check
```

## Performance Considerations - Phase 1

### Build Time
- **First import** (500 bookmarks):
  - Parse HTML: ~1s
  - Generate data: ~1s
  - Link checking: ~1 minute (100ms per bookmark × 500, 10 concurrent)
  - **Total: ~1 minute**

- **Subsequent builds** (10 new bookmarks):
  - Only check new/stale links
  - Link checking: ~1-2s
  - **Total: ~2-3s**

### Optimization Options
1. **Skip link checking**: `--skip-link-check` (instant builds)
2. **Adjust concurrency**: Modify `maxConcurrent` in check-links.ts

### Bundle Size
- Bookmarks data (500 bookmarks): ~100KB
- Favicons: Already base64 in JSON (included in 100KB estimate)
- Total: ~100-150KB for 500 bookmarks

## File Structure

```
/Users/mert/dev/personal/mertyas.in/
├── package.json                          # Add jsdom, scripts (no Puppeteer in Phase 1)
├── scripts/
│   ├── generate-feeds.ts                 # Existing
│   └── bookmarks/
│       ├── build-bookmarks.ts            # Main orchestrator
│       ├── parse-firefox-html.ts         # Parse Firefox HTML
│       ├── generate-bookmarks-data.ts    # Convert to JSON
│       ├── check-links.ts                # Link checking
│       └── utils/
│           ├── cache-manager.ts          # Cache read/write (link checks only)
│           └── hash-utils.ts             # ID generation
├── src/
│   ├── routes.tsx                        # Add /bookmarks route
│   ├── home/
│   │   └── Header.tsx                    # Add Bookmarks nav link
│   ├── utils/
│   │   ├── types.ts                      # Add bookmark types
│   │   └── bookmarks.ts                  # Data loading utilities
│   └── bookmarks/
│       ├── Bookmarks.tsx                 # Main component
│       ├── BookmarksGrid.tsx             # Grid container
│       ├── BookmarkCard.tsx              # Bookmark tile (favicons)
│       ├── FolderCard.tsx                # Folder tile
│       ├── BookmarksToolbar.tsx          # Search/filters
│       ├── bookmarks.css                 # Grid styles
│       └── data/
│           ├── bookmarks.json            # Generated by build
│           └── .cache/
│               └── bookmarks-cache.json  # Link check cache
```

## Testing Strategy

### Unit Tests
- Parse Firefox HTML (simple, nested, malformed)
- Generate stable IDs
- Flatten hierarchy
- Cache invalidation logic

### Integration Tests
- Full build pipeline with sample Firefox HTML
- Mock Puppeteer/fetch
- Verify cache updates

### Manual Tests
```bash
# Initial import
pnpm run import:bookmarks ~/Downloads/bookmarks.html
pnpm build
pnpm dev
# Visit http://localhost:5174/bookmarks

# Re-import (edit HTML first)
pnpm run import:bookmarks ~/Downloads/bookmarks-updated.html
# Should only process changed bookmarks
```

## Critical Files - Phase 1

1. **`/scripts/bookmarks/build-bookmarks.ts`** - Main orchestrator (parse, generate, check links)
2. **`/scripts/bookmarks/parse-firefox-html.ts`** - Firefox HTML parser (extracts bookmarks + favicons)
3. **`/src/utils/types.ts`** - Type definitions (Bookmark, BookmarkFolder, BookmarksData, BookmarkCache)
4. **`/src/bookmarks/Bookmarks.tsx`** - Main UI component (folder navigation, search)
5. **`/src/bookmarks/BookmarkCard.tsx`** - Bookmark tile component (favicon display)

## Phase 2: Future Enhancements

When ready to add preview screenshots:
1. Add `puppeteer` dependency
2. Create `scripts/bookmarks/generate-previews.ts`
3. Create `scripts/bookmarks/utils/screenshot.ts`
4. Update cache structure to include preview data
5. Update `BookmarkCard.tsx` to show previews with favicon fallback
6. Update CSS for preview display (150px height image area)
