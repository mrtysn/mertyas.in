# CLAUDE.md - mertyas.in

This file provides guidance to Claude Code when working with this personal website.

## Project Overview

Personal website at [mertyas.in](https://mertyas.in) built with React 19, TypeScript, and Vite.

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Package Manager**: pnpm (required)
- **Routing**: wouter

## Commands

```bash
pnpm install          # Install dependencies
pnpm run dev          # Start dev server
pnpm run build        # Build for production
pnpm run lint         # Run ESLint
pnpm run preview      # Preview production build
pnpm run validate     # Run validation script
```

## Project Structure

```
├── src/
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   ├── routes.tsx        # Route definitions
│   ├── home/             # Home page
│   ├── projects/         # Projects section
│   ├── styles/           # CSS styles
│   └── utils/            # Utility functions
└── dist/               # Build output (gitignored)
```

## Build Pipeline

The `build` command runs sequentially:
1. `tsc -b` - TypeScript compilation
2. `vite build` - Vite production build

## Code Style

- Use TypeScript strict mode
- Functional React components with hooks
- ESLint for linting

## Visual Design Rules

These rules protect the hand-crafted aesthetic of this site. Follow them when modifying any UI component.

1. **No decoration without information.** Every visual element must communicate something. Nothing is ornamental.
2. **Typography carries the hierarchy.** Size, weight, and color do the work — not backgrounds, gradients, or icons. Headings, names, and descriptions each have a distinct role.
3. **Use the palette, don't extend it.** All colors come from classless.css CSS variables (`--cfg`, `--cbg`, `--cmed`, `--clink`, `--cemph`, `--cdark`, `--clight`). No hex literals in custom.css.
4. **Interactions are subtle and fast.** Transitions under 200ms. No scale transforms above 1.02. No color changes outside the variable set.
5. **Semantic HTML first.** Lean on what classless.css styles for free. Add classes only when semantic elements aren't sufficient.
6. **No generic placeholders.** Every piece of work on the projects page names what was built and gives facts a reader can weigh. If it can't be said in a short paragraph and a few facts, reconsider whether it belongs on the page.
7. **Private work is described, not linked.** A link appears only where the repository or product is public.
8. **No LLM bloat.** Do not add wrapper divs, utility classes, or abstractions that exist only for "flexibility." If a pattern is used once, inline it.
