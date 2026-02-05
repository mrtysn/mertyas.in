import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import type { BookmarksData } from '../../src/utils/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../../src/bookmarks/data/bookmarks.json');
const CACHE_DIR = path.join(__dirname, '../../src/bookmarks/data/.cache');
const SUGGESTIONS_PATH = path.join(CACHE_DIR, 'llm-suggestions.json');

export interface BookmarkSuggestion {
  bookmarkId: string;
  bookmarkTitle: string;
  bookmarkUrl: string;
  suggestedDescription: string;
  suggestedTags: string[];
  suggestedFolderPath: string[];
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface OrganizeOptions {
  batchSize: number;
  dryRun: boolean;
  folder?: string;
  apiKey?: string;
  onProgress?: (event: OrganizeProgress) => void;
}

export interface OrganizeProgress {
  type: 'batch' | 'complete' | 'error' | 'info';
  batch?: number;
  totalBatches?: number;
  suggestionsCount?: number;
  totalSuggestions?: number;
  message?: string;
}

/**
 * Send bookmarks to Claude API for organization suggestions.
 */
export async function organizeBookmarks(options: OrganizeOptions): Promise<BookmarkSuggestion[]> {
  const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  if (!fs.existsSync(DATA_PATH)) {
    throw new Error('No bookmarks.json found');
  }

  const emit = options.onProgress || (() => {});

  const data: BookmarksData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  let bookmarks = data.flatBookmarks;

  // Filter by folder if specified
  if (options.folder) {
    bookmarks = bookmarks.filter(b =>
      b.folderPath.some(f => f.toLowerCase().includes(options.folder!.toLowerCase()))
    );
    console.log(`Filtered to ${bookmarks.length} bookmarks in folder "${options.folder}"`);
  }

  // Get existing folder paths for context
  const existingFolders = new Set<string>();
  for (const b of data.flatBookmarks) {
    existingFolders.add(b.folderPath.join('/'));
  }

  const client = new Anthropic();
  const allSuggestions: BookmarkSuggestion[] = [];

  // Load existing suggestions to avoid re-processing
  let existing: BookmarkSuggestion[] = [];
  if (fs.existsSync(SUGGESTIONS_PATH)) {
    existing = JSON.parse(fs.readFileSync(SUGGESTIONS_PATH, 'utf-8'));
  }
  const processedIds = new Set(existing.map(s => s.bookmarkId));

  // Filter out already-processed bookmarks
  bookmarks = bookmarks.filter(b => !processedIds.has(b.id));
  emit({ type: 'info', message: `${bookmarks.length} bookmarks to process (${existing.length} already have suggestions)` });

  if (bookmarks.length === 0) {
    emit({ type: 'complete', totalSuggestions: existing.length });
    return existing;
  }

  const totalBatches = Math.ceil(bookmarks.length / options.batchSize);

  // Process in batches
  for (let i = 0; i < bookmarks.length; i += options.batchSize) {
    const batch = bookmarks.slice(i, i + options.batchSize);
    const batchNum = Math.floor(i / options.batchSize) + 1;
    emit({ type: 'batch', batch: batchNum, totalBatches, suggestionsCount: allSuggestions.length });

    const batchInput = batch.map(b => ({
      id: b.id,
      title: b.title,
      url: b.url,
      currentFolder: b.folderPath.join('/'),
      currentTags: b.tags,
    }));

    const prompt = `You are organizing a personal bookmark collection. For each bookmark below, suggest:
1. A brief description (1-2 sentences describing what the page is about)
2. Relevant tags (lowercase, hyphen-separated, 3-7 tags)
3. A folder path (use existing folders when appropriate)
4. Your confidence level (high/medium/low)
5. Brief reasoning

Existing folders in the collection:
${Array.from(existingFolders).sort().join('\n')}

Bookmarks to organize:
${JSON.stringify(batchInput, null, 2)}

Respond with a JSON array of objects matching this schema exactly:
[{
  "bookmarkId": "string",
  "suggestedDescription": "string",
  "suggestedTags": ["string"],
  "suggestedFolderPath": ["string"],
  "confidence": "high" | "medium" | "low",
  "reasoning": "string"
}]

Only output the JSON array, no other text.`;

    if (options.dryRun) {
      console.log(`[DRY RUN] Would send ${batch.length} bookmarks to Claude API`);
      console.log(`Sample bookmark: ${batch[0].title} (${batch[0].url})`);
      continue;
    }

    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      });

      const text = message.content
        .filter(block => block.type === 'text')
        .map(block => block.type === 'text' ? block.text : '')
        .join('');

      const suggestions: Array<Omit<BookmarkSuggestion, 'bookmarkTitle' | 'bookmarkUrl'>> = JSON.parse(text);

      for (const s of suggestions) {
        const bookmark = batch.find(b => b.id === s.bookmarkId);
        if (bookmark) {
          allSuggestions.push({
            ...s,
            bookmarkTitle: bookmark.title,
            bookmarkUrl: bookmark.url,
          });
        }
      }

      emit({ type: 'batch', batch: batchNum, totalBatches, suggestionsCount: allSuggestions.length });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      emit({ type: 'error', message: `Batch ${batchNum} failed: ${msg}` });
    }
  }

  if (!options.dryRun && allSuggestions.length > 0) {
    // Merge with existing suggestions
    const merged = [...existing, ...allSuggestions];

    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(SUGGESTIONS_PATH, JSON.stringify(merged, null, 2), 'utf-8');
    emit({ type: 'complete', totalSuggestions: merged.length });
    return merged;
  }

  emit({ type: 'complete', totalSuggestions: existing.length });
  return [...existing, ...allSuggestions];
}

// CLI entry point
if (process.argv[1] && process.argv[1].includes('llm-organize')) {
  const args = process.argv.slice(2);
  const cliOptions: OrganizeOptions = {
    batchSize: 50,
    dryRun: false,
    onProgress: (e) => {
      if (e.type === 'info') console.log(e.message);
      else if (e.type === 'batch') console.log(`Batch ${e.batch}/${e.totalBatches} — ${e.suggestionsCount} suggestions so far`);
      else if (e.type === 'error') console.error(e.message);
      else if (e.type === 'complete') console.log(`\nComplete. ${e.totalSuggestions} total suggestions.`);
    },
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--batch-size' && args[i + 1]) {
      cliOptions.batchSize = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--dry-run') {
      cliOptions.dryRun = true;
    } else if (arg === '--folder' && args[i + 1]) {
      cliOptions.folder = args[i + 1];
      i++;
    }
  }

  organizeBookmarks(cliOptions).catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}
