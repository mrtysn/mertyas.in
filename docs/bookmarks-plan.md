# Bookmark Management System — Roadmap

> Long-term, incremental project. Each phase delivers standalone value. Break-friendly — resume anytime.

## Current State (Completed)

- Firefox HTML and JSON import (one-way, full replace)
- 2,553 bookmarks in `src/bookmarks/data/bookmarks.json` (86K lines)
- Browsable UI: folder navigation, breadcrumbs, search by title/URL/tag, CSS grid, favicons, status badges
- Link checking via HTTP HEAD (results cached but NOT persisted to bookmarks.json — status badges in UI are non-functional)
- IDs: `SHA-256(url::title).substring(0,16)` — stable if url+title unchanged
- Firefox JSON parser reads `guid` but discards it during conversion

## Phase Dependency Graph

```
Phase 1 (Foundation) ──┬──> Phase 2 (Link Health)
                       ├──> Phase 3 (LLM Organization)
                       ├──> Phase 5 (Two-Way Sync)
                       └──> Phase 4 (Enhanced UI) — richer with 2+3 done first
```

Phases 2, 3, 5 are independent after Phase 1. Phase 4 benefits from having 2+3 done first but can start anytime.

---

## Phase 1: Foundation — GUID Tracking + Merge-Based Import

**Goal:** Transform the import from "destructive replace" to "intelligent merge." Preserve Firefox GUIDs. Re-imports are additive, not destructive.

**Value:** Re-export from Firefox periodically, re-import, and not lose local enrichments.

### Data model changes (`src/utils/types.ts`)

Add to `Bookmark`:
- `firefoxGuid?: string` — Firefox's stable GUID
- `source: 'firefox' | 'manual'` — origin tracking
- `locallyModified?: boolean` — has user made local edits?
- `archiveUrl?: string` — for Phase 2, defined now for schema stability
- `previewImage?: string` — for Phase 2 OG image previews, defined now for schema stability
- `description?: string` — for Phase 3, defined now for schema stability

Add to `BookmarkFolder`:
- `firefoxGuid?: string`

Add `syncInfo` to `BookmarksData`:
```typescript
syncInfo: {
  lastImportSource: string;
  lastImportDate: number;
  importHistory: Array<{ date: number; source: string; added: number; updated: number; removed: number; }>;
}
```

Bump version to `"2.0.0"`.

### Pipeline changes

| File | Change |
|------|--------|
| `scripts/bookmarks/parse-firefox-json.ts` | Propagate `node.guid` → `ParsedNode.firefoxGuid` |
| `scripts/bookmarks/parse-firefox-html.ts` | Add `firefoxGuid?` to `ParsedNode` interface |
| `scripts/bookmarks/generate-bookmarks-data.ts` | Carry `firefoxGuid`, `source` through to output |
| `scripts/bookmarks/build-bookmarks.ts` | Use merge engine when existing data present; add `--force-replace` flag |

### New files

| File | Purpose |
|------|---------|
| `scripts/bookmarks/merge-bookmarks.ts` | Match by `firefoxGuid` > `id` > `url`. Update if not locally modified, flag conflicts otherwise. Returns `MergeResult` with counts. |
| `scripts/bookmarks/migrate-v2.ts` | One-time migration: add `source: 'firefox'`, set version 2.0.0 |

### Verify
- Import same file twice → 0 added, all unchanged
- Edit a bookmark locally (`locallyModified: true`), re-import → edit preserved
- `pnpm run build` succeeds, UI renders

---

## Phase 2: Link Health, Wayback Fallback & OG Image Previews

**Goal:** Dead bookmarks get archive URLs. Status badges become functional. Live bookmarks get preview images via Open Graph metadata.

### Key fix: persist link check results to bookmarks.json

After `check-links.ts` runs, copy `statusCode`/`lastChecked`/`checkError` from cache into the bookmark entries in `bookmarks.json`. This alone makes existing UI status badges work.

### New file: `scripts/bookmarks/check-wayback.ts`

- Wayback API: `https://archive.org/wayback/available?url=<url>`
- Only check bookmarks where `statusCode >= 400` or `statusCode === 0`
- Rate limit: 1 req/s (API constraint)
- Store result in `bookmark.archiveUrl`

### New file: `scripts/bookmarks/fetch-previews.ts`

- For live bookmarks (2xx status), fetch the HTML and extract `og:image` (or `twitter:image`) meta tag
- Download the image, resize/optimize (sharp or similar), store in `src/bookmarks/data/previews/{id}.webp`
- Add `previewImage?: string` field to `Bookmark` type (path to preview image)
- Cache results: only re-fetch if no cached preview or if bookmark URL changed
- Batch with concurrency limit (10 concurrent), skip if already cached
- Graceful fallback: if no OG image found, bookmark keeps using favicon/placeholder

### Data model addition (`src/utils/types.ts`)

Add to `Bookmark`:
- `previewImage?: string` — relative path to OG preview image (e.g., `previews/abc123.webp`)

### UI changes

- `BookmarkCard.tsx`: show preview image above title when available, link to `archiveUrl` for dead bookmarks, show "archived" badge
- `BookmarksToolbar.tsx`: add status filter (All / Live / Dead / Archived / Unchecked)
- `bookmarks.css`: `.status-archived` style, preview image styling

### Build pipeline addition

After link checking and Wayback checking, run preview fetching:
1. Link check → 2. Wayback check (dead links) → 3. OG image fetch (live links) → 4. Persist all results

Add `--skip-previews` flag. Previews are slow on first run but incremental thereafter.

### Verify
- Build with link checking → `statusCode` in bookmarks.json
- Dead bookmark → Wayback lookup → `archiveUrl` populated
- Live bookmark with `og:image` → preview image downloaded, `previewImage` set
- UI: preview images visible, badges visible, archived links clickable, filter works
- Bookmark without OG image → graceful fallback to favicon

---

## Phase 3: LLM-Assisted Organization

**Goal:** Better descriptions, tags, and folder placements via Claude API. All suggestions reviewed before applying.

### New files

| File | Purpose |
|------|---------|
| `scripts/bookmarks/llm-organize.ts` | CLI: batch bookmarks → Claude API → suggestions JSON. Flags: `--batch-size`, `--dry-run`, `--folder` |
| `scripts/bookmarks/apply-suggestions.ts` | Review + apply: `--interactive` or `--auto-apply-high`. Sets `locallyModified: true`. |

### Approach
- Group bookmarks by folder, send batches of ~50 to Claude
- Structured output: `{ suggestedDescription, suggestedTags, suggestedFolderPath, confidence, reasoning }`
- Suggestions saved to `.cache/llm-suggestions.json` — never auto-applied without review
- Add `@anthropic-ai/sdk` to devDependencies

### Scripts
```bash
pnpm bookmarks:organize [--batch-size 50] [--dry-run] [--folder "Development"]
pnpm bookmarks:apply [--interactive] [--auto-apply-high]
```

### Verify
- `--dry-run` on a small folder → sensible suggestions
- Apply one suggestion → bookmarks.json updated, `locallyModified: true`
- Re-import from Firefox → locally modified bookmarks preserved

---

## Phase 4: Enhanced UI — Search, Browse, Reference

**Goal:** Make the bookmarks page a genuinely useful public reference.

| Feature | Files | Detail |
|---------|-------|--------|
| URL-based folder navigation | `routes.tsx`, `Bookmarks.tsx` | `/bookmarks/Development/React` — shareable URLs via wouter |
| Sort options | `BookmarksToolbar.tsx`, `Bookmarks.tsx` | Date added, alphabetical, recently checked |
| Description in search | `Bookmarks.tsx` | Include `description` field in filter |
| Tag cloud | New: `TagCloud.tsx` | Clickable tag frequencies |
| Stats dashboard | New: `BookmarksStats.tsx` | Total counts, live/dead/archived, top domains |
| Expandable detail view | `BookmarkCard.tsx` | Full URL, description, tags, status, archive link, date |

### Verify
- `/bookmarks/Development/React` → correct folder, shareable URL
- Sort by date → correct ordering
- Tag click → filters view
- Stats accurate

---

## Phase 5: Two-Way Sync — Export Back to Firefox

**Goal:** Changes flow both directions via file-based sync with optional WebExtension.

### New files

| File | Purpose |
|------|---------|
| `scripts/bookmarks/export-firefox-json.ts` | Convert bookmarks.json → Firefox JSON (preserves GUIDs) |
| `scripts/bookmarks/sync-diff.ts` | Diff local vs. Firefox export → human-readable report |
| `extension/` directory | Minimal Firefox WebExtension: Export/Import buttons |

### Workflow
1. Extension (or manual): Export Firefox bookmarks → JSON
2. `pnpm import:bookmarks --input ~/Downloads/firefox-export.json` → merge
3. Make changes (organize, edit, etc.)
4. `pnpm bookmarks:export --output ~/Downloads/bookmarks-import.json`
5. Extension (or manual): Import JSON back into Firefox

### Scripts
```bash
pnpm bookmarks:export --output <path>
pnpm bookmarks:diff --firefox <path>
```

### Verify
- Export → import into fresh Firefox profile → correct structure
- Round-trip: Firefox → local → edit → export → Firefox → change reflected

---

## Resumability

- Every phase commits cleanly; `pnpm run build` always works between phases
- Each sub-step within a phase is a reasonable commit boundary
- New fields are all optional — existing UI never breaks mid-work
- Cache and suggestion files in `.cache/` — gitignored, safe to regenerate

## Critical Files

| File | Role | Phases |
|------|------|--------|
| `src/utils/types.ts` | All type definitions | 1, 2, 3 |
| `scripts/bookmarks/build-bookmarks.ts` | Build orchestrator | 1, 2 |
| `scripts/bookmarks/parse-firefox-json.ts` | Firefox GUID propagation | 1 |
| `scripts/bookmarks/generate-bookmarks-data.ts` | ParsedNode → Bookmark conversion | 1 |
| `src/bookmarks/BookmarkCard.tsx` | Primary UI component | 2, 4 |
| `src/bookmarks/Bookmarks.tsx` | Main page component | 4 |
