import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { BookmarkCache } from '../../../src/utils/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_PATH = path.join(__dirname, '../../../src/bookmarks/data/.cache/bookmarks-cache.json');

/**
 * Load the bookmark cache from disk
 */
export function loadCache(): BookmarkCache {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const content = fs.readFileSync(CACHE_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('Failed to load cache, starting fresh:', error);
  }

  return {
    version: '1.0.0',
    bookmarks: {},
  };
}

/**
 * Save the bookmark cache to disk
 */
export function saveCache(cache: BookmarkCache): void {
  try {
    const cacheDir = path.dirname(CACHE_PATH);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save cache:', error);
    throw error;
  }
}

/**
 * Clear the cache
 */
export function clearCache(): void {
  if (fs.existsSync(CACHE_PATH)) {
    fs.unlinkSync(CACHE_PATH);
  }
}
