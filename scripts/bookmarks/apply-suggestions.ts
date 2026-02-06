import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import type { Bookmark, BookmarkFolder, BookmarksData } from '../../src/utils/types.js';
import type { BookmarkSuggestion } from './llm-organize.js';
import { generateFolderId } from './utils/hash-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../../src/bookmarks/data/bookmarks.json');
const SUGGESTIONS_PATH = path.join(__dirname, '../../src/bookmarks/data/.cache/llm-suggestions.json');

interface ApplyOptions {
  interactive: boolean;
  autoApplyHigh: boolean;
}

async function applySuggestions(options: ApplyOptions): Promise<void> {
  if (!fs.existsSync(SUGGESTIONS_PATH)) {
    console.error('No suggestions file found. Run `pnpm bookmarks:organize` first.');
    process.exit(1);
  }

  if (!fs.existsSync(DATA_PATH)) {
    console.error('No bookmarks.json found');
    process.exit(1);
  }

  const suggestions: BookmarkSuggestion[] = JSON.parse(fs.readFileSync(SUGGESTIONS_PATH, 'utf-8'));
  const data: BookmarksData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

  const byId = new Map(data.flatBookmarks.map(b => [b.id, b]));

  let applied = 0;
  let skipped = 0;

  const rl = options.interactive
    ? readline.createInterface({ input: process.stdin, output: process.stdout })
    : null;

  for (const suggestion of suggestions) {
    const bookmark = byId.get(suggestion.bookmarkId);
    if (!bookmark) {
      skipped++;
      continue;
    }

    if (options.autoApplyHigh && suggestion.confidence === 'high') {
      applyToBookmark(bookmark, suggestion);
      applied++;
      console.log(`  [auto] ${bookmark.title} — ${suggestion.reasoning}`);
      continue;
    }

    if (options.interactive && rl) {
      console.log(`\n--- ${bookmark.title} ---`);
      console.log(`URL: ${bookmark.url}`);
      console.log(`Current folder: ${bookmark.folderPath.join('/')}`);
      console.log(`Current tags: ${bookmark.tags.join(', ')}`);
      console.log(`Suggested description: ${suggestion.suggestedDescription}`);
      console.log(`Suggested tags: ${suggestion.suggestedTags.join(', ')}`);
      console.log(`Suggested folder: ${suggestion.suggestedFolderPath.join('/')}`);
      console.log(`Confidence: ${suggestion.confidence}`);
      console.log(`Reasoning: ${suggestion.reasoning}`);

      const answer = await askQuestion(rl, 'Apply? (y/n/q) ');
      if (answer.toLowerCase() === 'q') break;
      if (answer.toLowerCase() === 'y') {
        applyToBookmark(bookmark, suggestion);
        applied++;
      } else {
        skipped++;
      }
    } else if (!options.interactive) {
      console.log(`  [${suggestion.confidence}] ${bookmark.title}: ${suggestion.suggestedDescription}`);
      skipped++;
    }
  }

  rl?.close();

  if (applied > 0) {
    data.root = rebuildFolderTree(data.flatBookmarks);
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\nApplied ${applied} suggestions, skipped ${skipped}. Saved.`);
  } else {
    console.log(`\nNo suggestions applied. ${skipped} skipped.`);
  }
}

function rebuildFolderTree(bookmarks: Bookmark[]): BookmarkFolder {
  const root: BookmarkFolder = {
    id: generateFolderId([]),
    name: 'Root',
    path: [],
    bookmarks: [],
    subfolders: [],
  };

  for (const bookmark of bookmarks) {
    let current = root;
    for (let i = 0; i < bookmark.folderPath.length; i++) {
      const segment = bookmark.folderPath[i];
      let subfolder = current.subfolders.find(f => f.name === segment);
      if (!subfolder) {
        const folderPath = bookmark.folderPath.slice(0, i + 1);
        subfolder = {
          id: generateFolderId(folderPath),
          name: segment,
          path: folderPath,
          bookmarks: [],
          subfolders: [],
        };
        current.subfolders.push(subfolder);
      }
      current = subfolder;
    }
    current.bookmarks.push(bookmark);
  }

  return root;
}

function applyToBookmark(bookmark: Bookmark, suggestion: BookmarkSuggestion): void {
  bookmark.description = suggestion.suggestedDescription;
  bookmark.tags = suggestion.suggestedTags;
  if (suggestion.suggestedFolderPath.length > 0) {
    bookmark.folderPath = suggestion.suggestedFolderPath;
  }
  bookmark.locallyModified = true;
}

function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

// CLI
const args = process.argv.slice(2);
const options: ApplyOptions = {
  interactive: false,
  autoApplyHigh: false,
};

for (const arg of args) {
  if (arg === '--interactive') options.interactive = true;
  if (arg === '--auto-apply-high') options.autoApplyHigh = true;
}

applySuggestions(options);
