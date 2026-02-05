# Bookmark Admin UI

A local browser-based tool for managing bookmarks. Replaces the CLI-only workflow with a visual interface.

## Quick Start

```bash
pnpm bookmarks:admin
# opens http://localhost:5175
```

Dev-only. Not part of the production build or the Vite dev server.

## Tabs

### Review Suggestions

The main curation workflow. Displays LLM suggestions from `.cache/llm-suggestions.json` as cards with side-by-side diffs of current vs suggested description, tags, and folder. Each card has Accept, Reject, and Edit & Accept actions. Filters by confidence level and folder. Bulk "Accept all high-confidence" button.

Every accept/reject is an immediate write to `bookmarks.json` — no batch save.

### Organize

Triggers LLM analysis via the Claude API. Configure API key, folder scope, and batch size, then start. Progress streams live via SSE. Generated suggestions appear in the Review tab.

Requires `ANTHROPIC_API_KEY` (enter in the UI or set in environment).

### Health

Stats bar showing total/live/dead/archived/unchecked counts.

Two operations:
- **Link Check** — HTTP HEAD requests against all bookmark URLs. Progress bar. Results persist to `bookmarks.json`.
- **Wayback Check** — Queries the Wayback Machine for dead links at 1 req/sec. Found archives are saved to the bookmark's `archiveUrl` field.

Below the controls: a table of dead/error bookmarks with delete buttons.

### Sync

Three panels:
- **Import** — Upload a Firefox JSON or HTML export. Merge-based by default; optional force-replace toggle.
- **Export** — Download bookmarks as Firefox-compatible JSON.
- **Diff** — Upload a Firefox export and compare against local data. Shows only-local, only-Firefox, title changes, and folder changes.

### Edit

Search bookmarks by title, URL, tags, or description. Click a result to open an inline edit form (title, description, tags, folder path). Save sets `locallyModified: true`. Delete with confirmation.

## Architecture

```
scripts/bookmarks/admin/
  server.ts   Express server, ~280 lines. Reads/writes bookmarks.json and
              .cache/llm-suggestions.json directly. Long-running ops stream
              SSE. Imports script functions directly (no child processes).
  ui.html     Single-file SPA. Vanilla JS, DaisyUI via CDN, no build step.
```

The server is a thin HTTP layer over the same functions the CLI scripts use. The refactored scripts (`llm-organize.ts`, `check-wayback.ts`, `check-links.ts`, `export-firefox-json.ts`, `sync-diff.ts`) export their core logic as callable functions with optional `onProgress` callbacks, while retaining their CLI entry points.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Serve UI |
| GET | `/api/bookmarks` | Full bookmarks.json |
| GET | `/api/suggestions` | LLM suggestions cache |
| GET | `/api/folders` | Distinct folder paths |
| GET | `/api/stats` | Counts: total, live, dead, archived, unchecked |
| POST | `/api/suggestion/:id/accept` | Apply suggestion, remove from cache |
| POST | `/api/suggestion/:id/reject` | Remove suggestion from cache |
| POST | `/api/suggestions/accept-high` | Bulk accept high-confidence |
| POST | `/api/bookmark/:id` | Edit bookmark fields |
| DELETE | `/api/bookmark/:id` | Delete bookmark |
| POST | `/api/organize` | Start LLM organize (SSE) |
| POST | `/api/link-check` | Start link check (SSE) |
| POST | `/api/wayback` | Start Wayback check (SSE) |
| POST | `/api/import` | Import Firefox export |
| GET | `/api/export` | Download Firefox JSON |
| POST | `/api/diff` | Diff against Firefox export |

SSE endpoints return `Content-Type: text/event-stream` with `progress`, `complete`, and `error` events.
