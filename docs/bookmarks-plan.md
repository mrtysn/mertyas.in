# Bookmark Management System — Roadmap

> Long-term, incremental project. Each phase delivers standalone value. Break-friendly — resume anytime.

## Current State

All five phases are implemented. The system is fully functional.

- **2,553 bookmarks** in `src/bookmarks/data/bookmarks.json`
- Data format: **v1.1.0** with merge-based import
- Firefox HTML and JSON import (merge-based, `--force-replace` for destructive)
- Browsable UI: folder navigation, breadcrumbs, search, CSS grid, favicons, status badges, OG previews
- Link checking via `pnpm bookmarks:check` (standalone CLI, not part of build)
- Wayback Machine fallback for dead links
- OG preview image extraction via `pnpm bookmarks:previews`
- LLM-assisted organization via Claude API
- Two-way sync with Firefox via file-based export/import and WebExtension (Manifest V3)
- Admin UI at `localhost:5175` for visual curation (dev-only)

## Build Pipeline

The production build (`pnpm run build`) runs:
1. `tsc -b` — TypeScript compilation
2. `vite build` — Vite production build
3. `tsx scripts/generate-feeds.ts` — Generate RSS/Atom feeds
4. `tsx scripts/bookmarks/build-bookmarks.ts` — Migrate if needed, persist cached link check results, update build metadata

**Link checking and preview fetching are separate CLIs**, not part of the build. This keeps builds fast.

## CLI Commands

| Command | Purpose |
|---------|---------|
| `pnpm run build` | Production build (fast, no network) |
| `pnpm import:bookmarks --input <file>` | Import/merge Firefox bookmarks |
| `pnpm bookmarks:check` | Check all bookmark links (standalone) |
| `pnpm bookmarks:previews` | Fetch OG preview images (standalone) |
| `pnpm bookmarks:wayback` | Check Wayback Machine for dead links |
| `pnpm bookmarks:organize` | LLM-assisted organization (requires ANTHROPIC_API_KEY) |
| `pnpm bookmarks:apply` | Review/apply LLM suggestions |
| `pnpm bookmarks:export --output <file>` | Export to Firefox JSON format |
| `pnpm bookmarks:diff --firefox <file>` | Diff local vs Firefox export |
| `pnpm bookmarks:migrate` | Migrate data to current format |
| `pnpm bookmarks:admin` | Launch admin UI (dev-only, port 5175) |

---

## Phase 1: Foundation — GUID Tracking + Merge-Based Import [DONE]

**Goal:** Transform the import from "destructive replace" to "intelligent merge." Preserve Firefox GUIDs. Re-imports are additive, not destructive.

### Data model (v1.1.0)

`Bookmark` type includes: `firefoxGuid`, `source`, `locallyModified`, `archiveUrl`, `previewImage`, `description`.

`BookmarksData` includes `syncInfo` with import history.

### Pipeline

- `parse-firefox-json.ts` propagates Firefox GUIDs
- `merge-bookmarks.ts` matches by `firefoxGuid` > `id` > `url`
- `migrate-v2.ts` handles v1 → v1.1.0 migration
- `build-bookmarks.ts` uses merge engine when existing data present

---

## Phase 2: Link Health, Wayback Fallback & OG Previews [DONE]

**Goal:** Dead bookmarks get archive URLs. Status badges are functional. Live bookmarks get OG preview images.

- `check-links.ts` — HTTP HEAD checks with cache, standalone CLI with `pnpm bookmarks:check`
- `check-wayback.ts` — Wayback API fallback for dead links
- `fetch-previews.ts` — Extract `og:image`/`twitter:image` URLs, store in `bookmark.previewImage`
- Build pipeline persists cached results into `bookmarks.json` without re-checking
- `BookmarkCard.tsx` renders preview images, archive links, status badges

---

## Phase 3: LLM-Assisted Organization [DONE]

**Goal:** Better descriptions, tags, and folder placements via Claude API.

- `llm-organize.ts` — Batch bookmarks → Claude API → suggestions JSON
- `apply-suggestions.ts` — Review + apply with `--interactive` or `--auto-apply-high`
- Applies description, tags, and folder path changes
- Rebuilds folder tree after folder path changes
- Sets `locallyModified: true` on modified bookmarks

---

## Phase 4: Enhanced UI [DONE]

**Goal:** Make the bookmarks page a genuinely useful public reference.

- URL-based folder navigation (`/bookmarks/Dev/React`)
- Sort options: date added, alphabetical, recently checked
- Tag cloud with clickable filtering
- Stats dashboard (total counts, live/dead/archived, top domains)
- Expandable detail view per bookmark
- Status filter (all/live/dead/archived/unchecked)

---

## Phase 5: Two-Way Sync [DONE]

**Goal:** Changes flow both directions via file-based sync with WebExtension.

- `export-firefox-json.ts` — Convert bookmarks.json → Firefox JSON (preserves GUIDs)
- `sync-diff.ts` — Diff local vs. Firefox export → human-readable report
- `extension/` — Firefox WebExtension (Manifest V3): Export/Import buttons

---

## Phase 6: Admin UI [DONE]

**Goal:** Browser-based admin for visual curation.

- Express server at `localhost:5175` (dev-only)
- LLM organize, health checks, sync, direct editing
- Single HTML file with embedded styles
- See `docs/bookmarks-admin.md` for details

---

## Critical Files

| File | Role |
|------|------|
| `src/utils/types.ts` | All type definitions |
| `scripts/bookmarks/build-bookmarks.ts` | Build orchestrator (no network calls) |
| `scripts/bookmarks/check-links.ts` | Standalone link checker CLI |
| `scripts/bookmarks/fetch-previews.ts` | OG preview image fetcher CLI |
| `scripts/bookmarks/merge-bookmarks.ts` | Merge engine |
| `scripts/bookmarks/apply-suggestions.ts` | LLM suggestion applier |
| `src/bookmarks/BookmarkCard.tsx` | Primary UI component |
| `src/bookmarks/Bookmarks.tsx` | Main page component |
| `extension/manifest.json` | WebExtension manifest (V3) |
