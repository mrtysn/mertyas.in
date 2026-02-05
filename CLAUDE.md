# CLAUDE.md - mertyas.in

## Communication & Collaboration Style

When working in this repository, adopt the following bearing:

- **Aristocratic** — Dignified and composed in expression, with refined but not florid language
- **Direct** — State findings plainly; no hedging, excessive qualification, or mealy-mouthed uncertainty
- **Empirical** — Demonstrate, do not merely assert; when challenged, investigate and provide proof rather than appealing to documentation alone
- **Receptive to challenge** — When the user questions a claim, welcome the scrutiny and verify empirically
- **Honest in error** — If you overcomplicated, misspoke, or raised false concerns, admit it plainly and move on without dwelling
- **Peer to peer** — The user is technically capable; do not condescend, over-explain, or pad responses with unnecessary caveats

**What this means in practice:**
- Use tables and structured formats for clarity
- When uncertain, say so directly and propose how to verify
- If a claim is questioned, demonstrate it rather than defend it
- Avoid phrases like "I think", "perhaps", "it might be" when you can investigate instead
- No effusive praise or validation — focus on the work
- Explain reasoning upfront — don't wait to be asked twice
- If told "I want explanation, not capitulation" — defend your reasoning; only yield to concrete counterarguments

This style prioritizes productive collaboration over performative helpfulness.

---

This file provides guidance to Claude Code when working with this personal website.

## Project Overview

Personal website at [mertyas.in](https://mertyas.in) built with React 19, TypeScript, and Vite.

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Package Manager**: pnpm (required)
- **Routing**: wouter
- **Markdown**: markdown-it with highlight.js

## Commands

```bash
pnpm install          # Install dependencies
pnpm run dev          # Start dev server
pnpm run build        # Build for production (includes feed & bookmark generation)
pnpm run lint         # Run ESLint
pnpm run preview      # Preview production build
pnpm run validate     # Run validation script
pnpm run import:bookmarks --input <file>  # Import bookmarks (merge-based)
pnpm run bookmarks:organize               # LLM-assisted organization (requires ANTHROPIC_API_KEY)
pnpm run bookmarks:apply                  # Review/apply LLM suggestions
pnpm run bookmarks:wayback                # Check Wayback Machine for dead links
pnpm run bookmarks:export --output <file> # Export to Firefox JSON format
pnpm run bookmarks:diff --firefox <file>  # Diff local vs Firefox export
pnpm run bookmarks:migrate                # Migrate data to v2 format
```

## Project Structure

```
├── src/
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   ├── routes.tsx        # Route definitions (includes /bookmarks/:rest* wildcard)
│   ├── components/       # Reusable components
│   ├── home/             # Home page
│   ├── posts/            # Blog posts
│   ├── projects/         # Projects section
│   ├── bookmarks/        # Bookmarks UI (Bookmarks, BookmarkCard, TagCloud, BookmarksStats, etc.)
│   ├── styles/           # CSS styles
│   └── utils/            # Utility functions (types.ts has v2 data model)
├── scripts/
│   ├── generate-feeds.ts       # RSS/Atom feed generation
│   └── bookmarks/              # Bookmark processing scripts (build, merge, parse, organize, export)
├── extension/          # Firefox WebExtension for bookmark sync
├── dist/               # Build output (gitignored)
└── docs/               # Documentation
```

## Build Pipeline

The `build` command runs sequentially:
1. `tsc -b` - TypeScript compilation
2. `vite build` - Vite production build
3. `tsx scripts/generate-feeds.ts` - Generate RSS/Atom feeds
4. `tsx scripts/bookmarks/build-bookmarks.ts` - Build bookmarks data

## Code Style

- Use TypeScript strict mode
- Functional React components with hooks
- ESLint for linting

## Bookmarks System

Full-featured bookmark management system. Data format is v2.0.0 with merge-based import.

**Implemented features:**
1. **Foundation** — GUID tracking, merge-based import (`--force-replace` for destructive), v2 migration
2. **Link Health** — Status codes persisted to bookmarks.json, Wayback Machine fallback for dead links, archive URL storage
3. **LLM Organization** — Claude API batch processing, suggestions cache, interactive/auto-apply modes
4. **Enhanced UI** — URL-based folder navigation (`/bookmarks/Dev/React`), sort (date/alpha/recently-checked), tag cloud, stats dashboard, expandable detail view, status filter (all/live/dead/archived/unchecked)
5. **Two-Way Sync** — Firefox JSON export, diff tool, Firefox WebExtension (`extension/`)

See `docs/bookmarks-plan.md` for the original design document.
