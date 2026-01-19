import crypto from 'crypto';

/**
 * Generate a stable ID for a bookmark based on its URL and title
 * Uses SHA-256 hash to ensure same bookmark gets same ID across imports
 */
export function generateBookmarkId(url: string, title: string): string {
  return crypto
    .createHash('sha256')
    .update(`${url}::${title}`)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Generate a stable ID for a folder based on its path
 */
export function generateFolderId(path: string[]): string {
  return crypto
    .createHash('sha256')
    .update(path.join('::'))
    .digest('hex')
    .substring(0, 16);
}
