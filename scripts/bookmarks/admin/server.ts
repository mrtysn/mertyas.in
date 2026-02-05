import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Bookmark, BookmarkFolder, BookmarksData } from '../../../src/utils/types.js';
import type { BookmarkSuggestion } from '../llm-organize.js';
import { organizeBookmarks } from '../llm-organize.js';
import { checkWayback } from '../check-wayback.js';
import { checkLinks } from '../check-links.js';
import { loadCache, saveCache } from '../utils/cache-manager.js';
import { toFirefoxJson } from '../export-firefox-json.js';
import { computeDiff } from '../sync-diff.js';
import { parseFirefoxJson } from '../parse-firefox-json.js';
import { parseFirefoxHtml } from '../parse-firefox-html.js';
import { generateBookmarksData } from '../generate-bookmarks-data.js';
import { mergeBookmarks } from '../merge-bookmarks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../../../src/bookmarks/data/bookmarks.json');
const CACHE_DIR = path.join(__dirname, '../../../src/bookmarks/data/.cache');
const SUGGESTIONS_PATH = path.join(CACHE_DIR, 'llm-suggestions.json');
const UI_PATH = path.join(__dirname, 'ui.html');

const PORT = 5175;
const app = express();

app.use(express.json({ limit: '50mb' }));

// --- Helpers ---

function readBookmarks(): BookmarksData {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}

function writeBookmarks(data: BookmarksData): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function readSuggestions(): BookmarkSuggestion[] {
  if (!fs.existsSync(SUGGESTIONS_PATH)) return [];
  return JSON.parse(fs.readFileSync(SUGGESTIONS_PATH, 'utf-8'));
}

function writeSuggestions(suggestions: BookmarkSuggestion[]): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  fs.writeFileSync(SUGGESTIONS_PATH, JSON.stringify(suggestions, null, 2), 'utf-8');
}

function syncFolderTree(data: BookmarksData): void {
  const byId = new Map(data.flatBookmarks.map(b => [b.id, b]));
  function walk(folder: BookmarkFolder): void {
    folder.bookmarks = folder.bookmarks.map(b => byId.get(b.id) || b);
    for (const sub of folder.subfolders) walk(sub);
  }
  walk(data.root);
}

function removeFolderBookmark(folder: BookmarkFolder, id: string): boolean {
  const idx = folder.bookmarks.findIndex(b => b.id === id);
  if (idx !== -1) {
    folder.bookmarks.splice(idx, 1);
    return true;
  }
  for (const sub of folder.subfolders) {
    if (removeFolderBookmark(sub, id)) return true;
  }
  return false;
}

// --- Routes ---

// Serve UI
app.get('/', (_req, res) => {
  res.sendFile(UI_PATH);
});

// Bookmarks data
app.get('/api/bookmarks', (_req, res) => {
  if (!fs.existsSync(DATA_PATH)) {
    return res.json({ flatBookmarks: [], root: { bookmarks: [], subfolders: [] } });
  }
  res.json(readBookmarks());
});

// Suggestions
app.get('/api/suggestions', (_req, res) => {
  res.json(readSuggestions());
});

// Folders
app.get('/api/folders', (_req, res) => {
  if (!fs.existsSync(DATA_PATH)) return res.json([]);
  const data = readBookmarks();
  const folders = new Set<string>();
  for (const b of data.flatBookmarks) {
    folders.add(b.folderPath.join('/'));
  }
  res.json(Array.from(folders).sort());
});

// Stats
app.get('/api/stats', (_req, res) => {
  if (!fs.existsSync(DATA_PATH)) {
    return res.json({ total: 0, live: 0, dead: 0, archived: 0, unchecked: 0 });
  }
  const data = readBookmarks();
  const bms = data.flatBookmarks;
  const total = bms.length;
  const live = bms.filter(b => b.statusCode && b.statusCode >= 200 && b.statusCode < 400).length;
  const dead = bms.filter(b => b.statusCode === 0 || (b.statusCode && b.statusCode >= 400)).length;
  const archived = bms.filter(b => b.archiveUrl).length;
  const unchecked = bms.filter(b => !b.statusCode && b.statusCode !== 0).length;
  res.json({ total, live, dead, archived, unchecked });
});

// Accept suggestion
app.post('/api/suggestion/:id/accept', (req, res) => {
  const { id } = req.params;
  const edits = req.body; // optional overrides: { description?, tags?, folderPath? }
  const suggestions = readSuggestions();
  const idx = suggestions.findIndex(s => s.bookmarkId === id);
  if (idx === -1) return res.status(404).json({ error: 'Suggestion not found' });

  const suggestion = suggestions[idx];
  const data = readBookmarks();
  const bookmark = data.flatBookmarks.find(b => b.id === id);
  if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });

  bookmark.description = edits?.description ?? suggestion.suggestedDescription;
  bookmark.tags = edits?.tags ?? suggestion.suggestedTags;
  bookmark.locallyModified = true;

  syncFolderTree(data);
  writeBookmarks(data);

  suggestions.splice(idx, 1);
  writeSuggestions(suggestions);

  res.json({ ok: true, remaining: suggestions.length });
});

// Reject suggestion
app.post('/api/suggestion/:id/reject', (req, res) => {
  const { id } = req.params;
  const suggestions = readSuggestions();
  const idx = suggestions.findIndex(s => s.bookmarkId === id);
  if (idx === -1) return res.status(404).json({ error: 'Suggestion not found' });

  suggestions.splice(idx, 1);
  writeSuggestions(suggestions);

  res.json({ ok: true, remaining: suggestions.length });
});

// Bulk accept high-confidence
app.post('/api/suggestions/accept-high', (_req, res) => {
  const suggestions = readSuggestions();
  const data = readBookmarks();
  const byId = new Map(data.flatBookmarks.map(b => [b.id, b]));

  let accepted = 0;
  const remaining: BookmarkSuggestion[] = [];

  for (const s of suggestions) {
    if (s.confidence === 'high') {
      const bookmark = byId.get(s.bookmarkId);
      if (bookmark) {
        bookmark.description = s.suggestedDescription;
        bookmark.tags = s.suggestedTags;
        bookmark.locallyModified = true;
        accepted++;
        continue;
      }
    }
    remaining.push(s);
  }

  syncFolderTree(data);
  writeBookmarks(data);
  writeSuggestions(remaining);

  res.json({ ok: true, accepted, remaining: remaining.length });
});

// Edit bookmark
app.post('/api/bookmark/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body as Partial<Pick<Bookmark, 'title' | 'description' | 'tags' | 'folderPath'>>;
  const data = readBookmarks();
  const bookmark = data.flatBookmarks.find(b => b.id === id);
  if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });

  if (updates.title !== undefined) bookmark.title = updates.title;
  if (updates.description !== undefined) bookmark.description = updates.description;
  if (updates.tags !== undefined) bookmark.tags = updates.tags;
  if (updates.folderPath !== undefined) bookmark.folderPath = updates.folderPath;
  bookmark.locallyModified = true;

  syncFolderTree(data);
  writeBookmarks(data);

  res.json({ ok: true });
});

// Delete bookmark
app.delete('/api/bookmark/:id', (req, res) => {
  const { id } = req.params;
  const data = readBookmarks();
  const idx = data.flatBookmarks.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Bookmark not found' });

  data.flatBookmarks.splice(idx, 1);
  removeFolderBookmark(data.root, id);
  data.buildInfo.totalBookmarks = data.flatBookmarks.length;
  writeBookmarks(data);

  res.json({ ok: true });
});

// --- SSE Long-running Operations ---

// LLM Organize
app.post('/api/organize', (req, res) => {
  const { folder, batchSize = 50, apiKey } = req.body;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  organizeBookmarks({
    batchSize,
    dryRun: false,
    folder,
    apiKey,
    onProgress: (e) => {
      if (e.type === 'batch') {
        send('progress', { batch: e.batch, totalBatches: e.totalBatches, suggestionsCount: e.suggestionsCount });
      } else if (e.type === 'complete') {
        send('complete', { totalSuggestions: e.totalSuggestions });
      } else if (e.type === 'error') {
        send('error', { message: e.message });
      } else if (e.type === 'info') {
        send('info', { message: e.message });
      }
    },
  }).then(() => {
    res.end();
  }).catch(err => {
    send('error', { message: err.message });
    res.end();
  });
});

// Link check
app.post('/api/link-check', (_req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  if (!fs.existsSync(DATA_PATH)) {
    send('error', { message: 'No bookmarks.json found' });
    res.end();
    return;
  }

  const data = readBookmarks();
  const cache = loadCache();

  checkLinks(data.flatBookmarks, cache, {
    recheckAfterDays: 7,
    maxConcurrent: 10,
    onProgress: (e) => {
      send(e.type, { checked: e.checked, total: e.total });
    },
  }).then(() => {
    saveCache(cache);

    // Persist link check results into bookmarks
    for (const bookmark of data.flatBookmarks) {
      const cached = cache.bookmarks[bookmark.id]?.linkCheck;
      if (cached) {
        bookmark.statusCode = cached.statusCode;
        bookmark.lastChecked = cached.checkedAt;
        bookmark.checkError = cached.error;
      }
    }
    syncFolderTree(data);
    writeBookmarks(data);

    send('complete', { checked: data.flatBookmarks.length });
    res.end();
  }).catch(err => {
    send('error', { message: err.message });
    res.end();
  });
});

// Wayback check
app.post('/api/wayback', (_req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  if (!fs.existsSync(DATA_PATH)) {
    send('error', { message: 'No bookmarks.json found' });
    res.end();
    return;
  }

  const data = readBookmarks();

  checkWayback(data.flatBookmarks, (e) => {
    send(e.type, e);
  }).then(found => {
    // Save updated bookmarks with archive URLs
    writeBookmarks(data);
    send('complete', { found, total: data.flatBookmarks.length });
    res.end();
  }).catch(err => {
    send('error', { message: err.message });
    res.end();
  });
});

// --- Sync Operations ---

// Import
app.post('/api/import', (req, res) => {
  const { content, filename, forceReplace = false } = req.body;
  if (!content || !filename) {
    return res.status(400).json({ error: 'content and filename required' });
  }

  // Write temp file, parse, merge
  const tmpPath = path.join(CACHE_DIR, `_import_tmp_${Date.now()}${path.extname(filename)}`);
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(tmpPath, content, 'utf-8');

    const ext = path.extname(filename).toLowerCase();
    let parsed;
    if (ext === '.json') {
      parsed = parseFirefoxJson(tmpPath);
    } else if (ext === '.html' || ext === '.htm') {
      parsed = parseFirefoxHtml(tmpPath);
    } else {
      return res.status(400).json({ error: `Unsupported format: ${ext}` });
    }

    const incoming = generateBookmarksData(parsed);

    if (!forceReplace && fs.existsSync(DATA_PATH)) {
      const existing = readBookmarks();
      const result = mergeBookmarks(existing, incoming, filename);
      writeBookmarks(result.data);
      res.json({
        ok: true,
        added: result.added,
        updated: result.updated,
        unchanged: result.unchanged,
        conflicts: result.conflicts,
        total: result.data.flatBookmarks.length,
      });
    } else {
      fs.writeFileSync(DATA_PATH, JSON.stringify(incoming, null, 2), 'utf-8');
      res.json({ ok: true, added: incoming.flatBookmarks.length, updated: 0, unchanged: 0, conflicts: 0, total: incoming.flatBookmarks.length });
    }
  } finally {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
});

// Export
app.get('/api/export', (_req, res) => {
  if (!fs.existsSync(DATA_PATH)) {
    return res.status(404).json({ error: 'No bookmarks.json found' });
  }
  const data = readBookmarks();
  const firefoxRoot = toFirefoxJson(data);
  res.setHeader('Content-Disposition', 'attachment; filename="bookmarks-firefox-export.json"');
  res.json(firefoxRoot);
});

// Diff
app.post('/api/diff', (req, res) => {
  const { content, filename } = req.body;
  if (!content || !filename) {
    return res.status(400).json({ error: 'content and filename required' });
  }

  if (!fs.existsSync(DATA_PATH)) {
    return res.status(404).json({ error: 'No local bookmarks.json found' });
  }

  const tmpPath = path.join(CACHE_DIR, `_diff_tmp_${Date.now()}${path.extname(filename)}`);
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(tmpPath, content, 'utf-8');

    const ext = path.extname(filename).toLowerCase();
    let parsed;
    if (ext === '.json') {
      parsed = parseFirefoxJson(tmpPath);
    } else if (ext === '.html' || ext === '.htm') {
      parsed = parseFirefoxHtml(tmpPath);
    } else {
      return res.status(400).json({ error: `Unsupported format: ${ext}` });
    }

    const local = readBookmarks();
    const firefox = generateBookmarksData(parsed);
    const result = computeDiff(local, firefox);
    res.json(result);
  } finally {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
});

// --- Start ---

app.listen(PORT, () => {
  console.log(`\nBookmark Admin UI running at http://localhost:${PORT}\n`);
});
